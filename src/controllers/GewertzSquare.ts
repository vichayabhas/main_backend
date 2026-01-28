import express from "express";
import {
  BookingGewertzSquareRoom,
  GetGewertzSquareBooking,
  GewertzSquareRegister,
  GewertzSquareRoomType,
  Id,
  InterGewertzSquareBooking,
  UpdateBookingGewertzSquareRoom,
  UserType,
} from "../models/interface";
import { getGewertzSquareUser } from "../middleware/auth";
import { isIdEqual, sendRes, swop } from "./setup";
import GewertzSquareBooking from "../models/GewertzSquareBooking";
import User, { buf } from "../models/User";
import UniversityStaff from "../models/UniversityStaff";
import bcrypt from "bcrypt";
import TimeOffset from "../models/TimeOffset";
import jwt from "jsonwebtoken";
import GewertzSquareUser from "../models/GewertzSquareUser";
function isAvailableGewertzSquareRoom(
  oldBookings: InterGewertzSquareBooking[],
  room: GewertzSquareRoomType,
) {
  const oldRooms = oldBookings.map(({ room }) => room);
  if (oldRooms.includes(room)) {
    return false;
  }
  if (room == "Demo floor" || room == "E-III") {
    return true;
  }
  const oldRooms2 = oldRooms.filter(
    (oldRoom) => oldRoom != "Demo floor" && oldRoom != "E-III",
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
function checkTimeRange(start: Date, end: Date) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startHour = startDate.getHours();
  const startMinute = startDate.getMinutes();

  const endHour = endDate.getHours();
  const endMinute = endDate.getMinutes();

  const startEarly = startHour < 8 || (startHour === 8 && startMinute === 0);

  const endAfterFive = endHour > 17 || (endHour === 17 && endMinute === 0);

  return {
    startEarly,
    endAfterFive,
  };
}
function isGreaterThan3Hours(start: Date, end: Date) {
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  const THREE_HOURS = 3 * 60 * 60 * 1000;
  return durationMs > THREE_HOURS;
}
function coversWeekend(start: Date, end: Date) {
  const current = new Date(start);
  const endDate = new Date(end);

  // Normalize to midnight to safely iterate days
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const day = current.getDay();
    if (day === 0 || day === 6) {
      return true;
    }
    current.setDate(current.getDate() + 1);
  }
  return false;
}
function checkIsOverlap(
  newBooking: BookingGewertzSquareRoom,
  oldBooking: BookingGewertzSquareRoom,
): boolean {
  if (
    new Date(oldBooking.start) <= new Date(newBooking.start) &&
    new Date(newBooking.start) < new Date(oldBooking.end)
  ) {
    return true;
  }
  if (
    new Date(oldBooking.start) < new Date(newBooking.end) &&
    new Date(newBooking.end) <= new Date(oldBooking.end)
  ) {
    return true;
  }
  return false;
}
export async function bookingGewertzSquareRoom(
  req: express.Request,
  res: express.Response,
) {
  const user = await getGewertzSquareUser(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  const userType: UserType = user.userType;
  if (
    !user.user.departureAuths.includes("วิศวกรรมไฟฟ้า (Electrical Engineering)")
  ) {
    sendRes(res, false);
    return;
  }
  const { start, end, room, tel }: BookingGewertzSquareRoom = req.body;
  let approved = false;

  let i = 0;
  const allBookings = await GewertzSquareBooking.find();
  if (
    isAvailableGewertzSquareRoom(
      allBookings.filter((old) =>
        checkIsOverlap({ start, end, room, tel, approved }, old),
      ),
      room,
    )
  ) {
    approved = true;
  }
  if (coversWeekend(start, end)) {
    approved = false;
  }
  if (isGreaterThan3Hours(start, end)) {
    approved = false;
  }
  if (new Date(end).getTime() < new Date(start).getTime()) {
    approved = false;
  }
  const { startEarly, endAfterFive } = checkTimeRange(start, end);
  if (startEarly || endAfterFive) {
    approved = false;
  }
  if (user.user.extraAuth.includes("gewertz square admin")) {
    approved = true;
  }
  const booking = await GewertzSquareBooking.create({
    tel,
    userId: user.user._id,
    userType,
    room,
    start,
    end,
    approved,
  });
  const gewertzSquareBookingIds = swop(
    null,
    booking._id,
    user.user.gewertzSquareBookingIds,
  );
  switch (userType) {
    case "student": {
      await User.findByIdAndUpdate(user.user._id, {
        gewertzSquareBookingIds,
      });
      break;
    }
    case "universityStaff": {
      await UniversityStaff.findByIdAndUpdate(user.user._id, {
        gewertzSquareBookingIds,
      });
      break;
    }
    case "gewertzSquare": {
      await GewertzSquareUser.findByIdAndUpdate(user.user._id, {
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
      gewertzSquareBookingIds[i++],
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const displayOffset = await TimeOffset.findById(user.user.displayOffsetId);
  const selectOffset = await TimeOffset.findById(user.user.selectOffsetId);
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
    displayOffset: displayOffset
      ? displayOffset
      : { day: 0, hour: 0, minute: 0 },
    selectOffset: selectOffset ? selectOffset : { day: 0, hour: 0, minute: 0 },
  };
  res.status(200).json(buffer);
}
export async function getGewertzSquareBooking(
  req: express.Request,
  res: express.Response,
) {
  const userRaw = await getGewertzSquareUser(req);
  const all = await GewertzSquareBooking.find();

  if (!userRaw) {
    const buffer: GetGewertzSquareBooking = {
      all,
      own: [],
      selectOffset: { day: 0, hour: 0, minute: 0 },
      displayOffset: { day: 0, hour: 0, minute: 0 },
    };
    res.status(200).json(buffer);
    return;
  }
  const { user } = userRaw;

  const own: InterGewertzSquareBooking[] = [];
  let i = 0;
  while (i < user.gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      user.gewertzSquareBookingIds[i++],
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const displayOffset = await TimeOffset.findById(user.displayOffsetId);
  const selectOffset = await TimeOffset.findById(user.selectOffsetId);
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
    displayOffset: displayOffset
      ? displayOffset
      : { day: 0, hour: 0, minute: 0 },
    selectOffset: selectOffset ? selectOffset : { day: 0, hour: 0, minute: 0 },
  };
  res.status(200).json(buffer);
}
export async function updateBookingGewertzSquareRoom(
  req: express.Request,
  res: express.Response,
) {
  const userRaw = await getGewertzSquareUser(req);
  if (!userRaw) {
    sendRes(res, false);
    return;
  }
  const { user } = userRaw;
  if (!user.departureAuths.includes("วิศวกรรมไฟฟ้า (Electrical Engineering)")) {
    sendRes(res, false);
    return;
  }
  const { room, tel, start, end, _id }: UpdateBookingGewertzSquareRoom =
    req.body;
  let approved = false;

  const allBookings = await GewertzSquareBooking.find();
  const allBookingOverlap = allBookings.filter((old) => {
    return (
      checkIsOverlap({ start, end, room, tel, approved }, old) &&
      !isIdEqual(_id, old._id)
    );
  });
  if (isAvailableGewertzSquareRoom(allBookingOverlap, room)) {
    approved = true;
  }

  if (coversWeekend(start, end)) {
    approved = false;
  }
  if (isGreaterThan3Hours(start, end)) {
    approved = false;
  }

  if (new Date(end).getTime() < new Date(start).getTime()) {
    approved = false;
  }
  const { startEarly, endAfterFive } = checkTimeRange(start, end);
  if (startEarly || endAfterFive) {
    approved = false;
  }
  if (user.extraAuth.includes("gewertz square admin")) {
    approved = true;
  }
  await GewertzSquareBooking.findByIdAndUpdate(_id, {
    tel,
    start,
    end,
    room,
    approved,
  });
  const all = await GewertzSquareBooking.find();
  const own: InterGewertzSquareBooking[] = [];
  let i = 0;
  while (i < user.gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      user.gewertzSquareBookingIds[i++],
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const displayOffset = await TimeOffset.findById(user.displayOffsetId);
  const selectOffset = await TimeOffset.findById(user.selectOffsetId);
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
    displayOffset: displayOffset
      ? displayOffset
      : { day: 0, hour: 0, minute: 0 },
    selectOffset: selectOffset ? selectOffset : { day: 0, hour: 0, minute: 0 },
  };
  res.status(200).json(buffer);
}

export async function deleteBookingGewertzSquareRoom(
  req: express.Request,
  res: express.Response,
) {
  const userRaw = await getGewertzSquareUser(req);
  if (!userRaw) {
    sendRes(res, false);
    return;
  }
  const { user } = userRaw;
  if (!user.departureAuths.includes("วิศวกรรมไฟฟ้า (Electrical Engineering)")) {
    sendRes(res, false);
    return;
  }

  const booking = await GewertzSquareBooking.findById(req.params.id);
  if (!booking) {
    sendRes(res, false);
    return;
  }
  if (
    !isIdEqual(user._id, booking.userId) &&
    !user.extraAuth.includes("gewertz square admin")
  ) {
    sendRes(res, false);
    return;
  }
  let gewertzSquareBookingIds: Id[];

  switch (booking.userType) {
    case "student": {
      const user = await User.findById(booking.userId);
      if (!user) {
        sendRes(res, false);
        return;
      }
      gewertzSquareBookingIds = swop(
        booking._id,
        null,
        user.gewertzSquareBookingIds,
      );
      await user.updateOne({ gewertzSquareBookingIds });
      break;
    }
    case "universityStaff": {
      const user = await UniversityStaff.findById(booking.userId);
      if (!user) {
        sendRes(res, false);
        return;
      }
      gewertzSquareBookingIds = swop(
        booking._id,
        null,
        user.gewertzSquareBookingIds,
      );
      await user.updateOne({ gewertzSquareBookingIds });
      break;
    }
    case "gewertzSquare": {
      const user = await GewertzSquareUser.findById(booking.userId);
      if (!user) {
        sendRes(res, false);
        return;
      }
      gewertzSquareBookingIds = swop(
        booking._id,
        null,
        user.gewertzSquareBookingIds,
      );
      await user.updateOne({ gewertzSquareBookingIds });
      break;
    }
  }

  const all = await GewertzSquareBooking.find();
  const own: InterGewertzSquareBooking[] = [];
  let i = 0;
  if (!isIdEqual(booking.userId, user._id)) {
    gewertzSquareBookingIds = user.gewertzSquareBookingIds;
  }
  await booking.deleteOne();
  while (i < gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      gewertzSquareBookingIds[i++],
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const displayOffset = await TimeOffset.findById(user.displayOffsetId);
  const selectOffset = await TimeOffset.findById(user.selectOffsetId);
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
    displayOffset: displayOffset || { day: 0, hour: 0, minute: 0 },
    selectOffset: selectOffset || { day: 0, hour: 0, minute: 0 },
  };
  res.status(200).json(buffer);
}
export async function gewertzSquareRegister(
  req: express.Request,
  res: express.Response,
) {
  try {
    const {
      name,
      lastname,
      password,
      tel,
      email,
    }: //private
    GewertzSquareRegister = req.body;
    const select = await TimeOffset.create({});
    const display = await TimeOffset.create({});
    const user = await GewertzSquareUser.create({
      name,
      lastname,
      password,
      email,
      tel,
      displayOffsetId: display._id,
      selectOffsetId: select._id,
    });
    sendTokenResponse(user._id, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
    });
    console.log(err);
  }
}
export async function gewertzSquareLogin(
  req: express.Request,
  res: express.Response,
) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      success: false,
      msg: "Please provide an email and password",
    });
    return;
  }
  let user = await User.findOne({
    email,
  }).select("+password");
  if (!user) {
    user = await UniversityStaff.findOne({ email }).select("+password");
  }
  if (!user) {
    user = await GewertzSquareUser.findOne({ email }).select("+password");
  }
  if (!user) {
    res.status(400).json({
      success: false,
      msg: "Invalid credentials",
    });
    return;
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(401).json({
      success: false,
      msg: "Invalid credentials",
    });
    return;
  }
  sendTokenResponse(user._id, 200, res);
}
const sendTokenResponse = (
  id: Id,
  statusCode: number,
  res: express.Response,
) => {
  const token = jwt.sign({ id }, buf, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE || "0") * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
export async function getGewertzSquareUserMe(
  req: express.Request,
  res: express.Response,
) {
  const user = await getGewertzSquareUser(req);
  res.status(200).json(user);
}
export async function updateGewertzSquareAccount(
  req: express.Request,
  res: express.Response,
) {
  const user = await getGewertzSquareUser(req);
  if (user) {
    await user.user.updateOne(req.body);
    sendRes(res, true);
    return;
  }
  sendRes(res, false);
}
export async function approveBookingGewertzSquareRoom(
  req: express.Request,
  res: express.Response,
) {
  const userRaw = await getGewertzSquareUser(req);
  if (!userRaw) {
    sendRes(res, false);
    return;
  }
  const { user } = userRaw;
  if (!user.departureAuths.includes("วิศวกรรมไฟฟ้า (Electrical Engineering)")) {
    sendRes(res, false);
    return;
  }

  const booking = await GewertzSquareBooking.findById(req.params.id);
  if (!booking) {
    sendRes(res, false);
    return;
  }
  if (!user.extraAuth.includes("gewertz square admin")) {
    sendRes(res, false);
    return;
  }
  const gewertzSquareBookingIds: Id[] = user.gewertzSquareBookingIds;
  await booking.updateOne({ approved: true });

  const all = await GewertzSquareBooking.find();
  const own: InterGewertzSquareBooking[] = [];
  let i = 0;

  while (i < gewertzSquareBookingIds.length) {
    const buf = await GewertzSquareBooking.findById(
      gewertzSquareBookingIds[i++],
    );
    if (!buf) {
      continue;
    }
    own.push(buf);
  }
  const displayOffset = await TimeOffset.findById(user.displayOffsetId);
  const selectOffset = await TimeOffset.findById(user.selectOffsetId);
  const buffer: GetGewertzSquareBooking = {
    all,
    own,
    displayOffset: displayOffset || { day: 0, hour: 0, minute: 0 },
    selectOffset: selectOffset || { day: 0, hour: 0, minute: 0 },
  };
  res.status(200).json(buffer);
}
