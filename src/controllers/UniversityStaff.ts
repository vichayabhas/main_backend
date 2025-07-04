import express from "express";
import {
  Departure,
  ExtraAuths,
  Id,
  UniversityStaffRegister,
  UpdateUniversityStaff,
  UserType,
} from "../models/interface";

import TimeOffset from "../models/TimeOffset";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { buf } from "../models/User";
import { sendRes } from "./setup";
import UniversityStaff from "../models/UniversityStaff";
import { getUniversityStaff } from "../middleware/auth";
import GewertzSquareUser from "../models/GewertzSquareUser";
import GewertzSquareBooking from "../models/GewertzSquareBooking";
export async function universityStaffRegister(
  req: express.Request,
  res: express.Response
) {
  try {
    const {
      name,
      lastname,
      nickname,
      email,
      password,
      tel,
    }: //private
    UniversityStaffRegister = req.body;
    let gewertzSquareBookingIds: Id[] = [];
    let departureAuths: Departure[] = [];
    let fridayActEn: boolean = false;
    let extraAuth: ExtraAuths[] = [];
    const gewertzSquareUser = await GewertzSquareUser.findOne({ email }).select(
      "+password"
    );
    if (gewertzSquareUser) {
      const isMatch = await bcrypt.compare(
        password,
        gewertzSquareUser.password
      );
      if (!isMatch) {
        res.status(401).json({
          success: false,
          msg: "Invalid credentials",
        });
        return;
      }
      gewertzSquareBookingIds = gewertzSquareUser.gewertzSquareBookingIds;
      fridayActEn = gewertzSquareUser.fridayActEn;
      departureAuths = gewertzSquareUser.departureAuths;
      extraAuth = gewertzSquareUser.extraAuth;
    }
    const select = await TimeOffset.create({});
    const display = await TimeOffset.create({});
    const user = await UniversityStaff.create({
      name,
      nickname,
      lastname,
      password,
      email,
      tel,
      displayOffsetId: display._id,
      selectOffsetId: select._id,
      gewertzSquareBookingIds,
      fridayActEn,
      departureAuths,
      extraAuth,
    });
    if (gewertzSquareUser) {
      let i = 0;
      while (i < gewertzSquareBookingIds.length) {
        const userType: UserType = "universityStaff";
        await GewertzSquareBooking.findByIdAndUpdate(
          gewertzSquareBookingIds[i++],
          { userType, userId: user._id }
        );
      }
      await gewertzSquareUser.deleteOne();
    }
    sendTokenResponse(user._id, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
    });
    console.log(err);
  }
}
export async function universityStaffLogin(
  req: express.Request,
  res: express.Response
) {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      success: false,
      msg: "Please provide an email and password",
    });
    return;
  }
  const user = await UniversityStaff.findOne({
    email,
  }).select("+password");
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
  res: express.Response
) => {
  const token = jwt.sign({ id }, buf, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  const options = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRE || "0") * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
const testJwt = buf;
export async function getUniversityStaffMe(
  req: express.Request,
  res: express.Response
) {
  let token: string | null | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    sendRes(res, false);
    return;
  }
  try {
    const decoded = jwt.verify(token.toString(), testJwt);
    const { id } = decoded as { id: string };
    const user = await UniversityStaff.findById(id).select("+password");
    res.status(200).json(user);
  } catch {
    sendRes(res, false);
  }
}
export async function updateUniversityStaff(
  req: express.Request,
  res: express.Response
) {
  const input: UpdateUniversityStaff = req.body;
  const user = await getUniversityStaff(req);
  if (!user) {
    sendRes(res, false);
    return;
  }
  await user.updateOne(input);
  sendRes(res, true);
}
