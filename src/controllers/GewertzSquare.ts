import express from "express";
import {
  BookingGewertzSquareRoom,
  CommonUser,
  GetGewertzSquareBooking,
  gewertzSquareAvailableTimes,
  gewertzSquareMaxContinue,
  GewertzSquareRoomType,
  InterGewertzSquareBooking,
  UpdateBookingGewertzSquareRoom,
  UserType,
} from "../models/interface";
import { getUniversityStaff, getUser } from "../middleware/auth";
import { sendRes, swop } from "./setup";
import GewertzSquareBooking from "../models/GewertzSquareBooking";
import User from "../models/User";
import UniversityStaff from "../models/UniversityStaff";
function isAvailableGewertzSquareRoom(
  oldBookings: InterGewertzSquareBooking[],
  room: GewertzSquareRoomType
) {
  const oldRooms = oldBookings.map(({ room }) => room);
  if (oldRooms.includes(room)) {
    return false;
  }
  if (room == "Demo form" || room == "E-III") {
    return true;
  }
  const oldRooms2 = oldRooms.filter(
    (oldRoom) => oldRoom != "Demo form" && oldRoom != "E-III"
  );
  if (oldRooms2.length == 0) {
    return true;
  }
  if (oldRooms2.includes("Spark1&2&3") || oldRooms2.length == 3) {
    return false;
  }
  switch (room) {
    case "Spark1": {
      return !oldRooms2.includes("Spark1&2");
    }
    case "Spark2": {
      return !oldRooms2.includes("Spark1&2") && !oldRooms2.includes("Spark2&3");
    }
    case "Spark3": {
      return !oldRooms2.includes("Spark2&3");
    }
    case "Spark1&2": {
      return (
        !oldRooms2.includes("Spark1") &&
        !oldRooms2.includes("Spark2") &&
        !oldRooms2.includes("Spark2&3")
      );
    }
    case "Spark2&3": {
      return (
        !oldRooms2.includes("Spark3") &&
        !oldRooms2.includes("Spark2") &&
        !oldRooms2.includes("Spark1&2")
      );
    }
    case "Spark1&2&3": {
      return false;
    }
  }
}
export async function bookingGewertzSquareRoom(
  req: express.Request,
  res: express.Response
) {
  let userType: UserType;
  let user: CommonUser | null;
  user = await getUser(req);
  if (!user) {
    user = await getUniversityStaff(req);
    if (!user) {
      sendRes(res, false);
      return;
    } else {
      userType = "universityStaff";
    }
  } else {
    userType = "student";
  }
  if (!user.departureAuths.includes("วิศวกรรมไฟฟ้า (Electrical Engineering)")) {
    sendRes(res, false);
    return;
  }
  const {
    day,
    month,
    year,
    room,
    tel,
    time,
    period,
  }: BookingGewertzSquareRoom = req.body;

  if (
    time + period - 1 >
    gewertzSquareAvailableTimes[gewertzSquareAvailableTimes.length - 1]
  ) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < gewertzSquareMaxContinue) {
    const oldBookings = await GewertzSquareBooking.find({
      day,
      month,
      year,
      time: time - i,
    });
    const oldBookings2 = oldBookings.filter(
      (oldBooking) => oldBooking.period > i
    );
    if (!isAvailableGewertzSquareRoom(oldBookings2, room)) {
      sendRes(res, false);
      return;
    }
    if (time - ++i < gewertzSquareAvailableTimes[0]) {
      break;
    }
  }
  i = 0;
  while (i < period - 1) {
    const oldBookings = await GewertzSquareBooking.find({
      day,
      month,
      year,
      time: time + ++i,
    });
    if (!isAvailableGewertzSquareRoom(oldBookings, room)) {
      sendRes(res, false);
      return;
    }
  }
  const booking = await GewertzSquareBooking.create({
    tel,
    time,
    period,
    day,
    month,
    year,
    userId: user._id,
    userType,
    room,
  });
  const gewertzSquareBookingIds = swop(
    null,
    booking._id,
    user.gewertzSquareBookingIds
  );
  switch (userType) {
    case "student": {
      await User.findByIdAndUpdate(user._id, {
        gewertzSquareBookingIds,
      });
      break;
    }
    case "universityStaff": {
      await UniversityStaff.findByIdAndUpdate(user._id, {
        gewertzSquareBookingIds,
      });
      break;
    }
  }
  const all = await GewertzSquareBooking.find();
  const own: InterGewertzSquareBooking[] = [];
  i = 0;
  while (i < gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      gewertzSquareBookingIds[i++]
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
  };
  res.status(200).json(buffer);
}
export async function getGewertzSquareBooking(
  req: express.Request,
  res: express.Response
) {
  let user: CommonUser | null;
  user = await getUser(req);
  if (!user) {
    user = await getUniversityStaff(req);
    if (!user) {
      const all = await GewertzSquareBooking.find();
      const buffer: GetGewertzSquareBooking = { all, own: [] };
      res.status(200).json(buffer);
      return;
    }
  }
  const all = await GewertzSquareBooking.find();
  const own: InterGewertzSquareBooking[] = [];
  let i = 0;
  while (i < user.gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      user.gewertzSquareBookingIds[i++]
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
  };
  res.status(200).json(buffer);
}
export async function updateBookingGewertzSquareRoom(
  req: express.Request,
  res: express.Response
) {
  let user: CommonUser | null;
  user = await getUser(req);
  if (!user) {
    user = await getUniversityStaff(req);
    if (!user) {
      sendRes(res, false);
      return;
    }
  }
  if (!user.departureAuths.includes("วิศวกรรมไฟฟ้า (Electrical Engineering)")) {
    sendRes(res, false);
    return;
  }
  const {
    day,
    month,
    year,
    room,
    tel,
    time,
    period,
    _id,
  }: UpdateBookingGewertzSquareRoom = req.body;
  if (
    time + period - 1 >
    gewertzSquareAvailableTimes[gewertzSquareAvailableTimes.length - 1]
  ) {
    sendRes(res, false);
    return;
  }
  let i = 0;
  while (i < gewertzSquareMaxContinue) {
    const oldBookings = await GewertzSquareBooking.find({
      day,
      month,
      year,
      time: time - i,
    });
    const oldBookings2 = oldBookings.filter(
      (oldBooking) =>
        oldBooking.period > i && oldBooking._id.toString() != _id.toString()
    );
    if (!isAvailableGewertzSquareRoom(oldBookings2, room)) {
      sendRes(res, false);
      return;
    }
    if (time - ++i < gewertzSquareAvailableTimes[0]) {
      break;
    }
  }
  i = 0;
  while (i < period - 1) {
    const oldBookings = await GewertzSquareBooking.find({
      day,
      month,
      year,
      time: time + ++i,
    });
    if (
      !isAvailableGewertzSquareRoom(
        oldBookings.filter(
          (oldBooking) => oldBooking._id.toString() != _id.toString()
        ),
        room
      )
    ) {
      sendRes(res, false);
      return;
    }
  }
  await GewertzSquareBooking.findByIdAndUpdate(_id, {
    tel,
    time,
    period,
    day,
    month,
    year,
    room,
  });
  const all = await GewertzSquareBooking.find();
  const own: InterGewertzSquareBooking[] = [];
  i = 0;
  while (i < user.gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      user.gewertzSquareBookingIds[i++]
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
  };
  res.status(200).json(buffer);
}

export async function deleteBookingGewertzSquareRoom(
  req: express.Request,
  res: express.Response
) {
  let user: CommonUser | null;
  user = await getUser(req);
  if (!user) {
    user = await getUniversityStaff(req);
    if (!user) {
      sendRes(res, false);
      return;
    }
  }
  if (!user.departureAuths.includes("วิศวกรรมไฟฟ้า (Electrical Engineering)")) {
    sendRes(res, false);
    return;
  }

  const booking = await GewertzSquareBooking.findById(req.params.id);
  if (!booking) {
    sendRes(res, false);
    return;
  }
  const gewertzSquareBookingIds = swop(
    booking._id,
    null,
    user.gewertzSquareBookingIds
  );
  switch (booking.userType) {
    case "student": {
      await User.findByIdAndUpdate(booking.userId, {
        gewertzSquareBookingIds,
      });
      break;
    }
    case "universityStaff": {
      await UniversityStaff.findByIdAndUpdate(booking.userId, {
        gewertzSquareBookingIds,
      });
      break;
    }
  }
  await booking.deleteOne();
  const all = await GewertzSquareBooking.find();
  const own: InterGewertzSquareBooking[] = [];
  let i = 0;
  while (i < gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      gewertzSquareBookingIds[i++]
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
  };
  res.status(200).json(buffer);
}
