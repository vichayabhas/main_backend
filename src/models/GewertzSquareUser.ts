import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataString,
  getDefaultBoolean,
} from "../controllers/setup";
import { departures } from "./interface";

const schema = new mongoose.Schema({
  name: dataString,
  lastname: dataString,
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    Math: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },

  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  tel: {
    type: String,
    unique: true,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  shortActivityIds: arrayObjectId,
  selectOffsetId: dataId,
  displayOffsetId: dataId,
  bookingRoomIds: arrayObjectId,
  gewertzSquareBookingIds: arrayObjectId,
  fridayActEn: getDefaultBoolean(false),
  departureAuths: {
    type: [
      {
        type: String,
        enum: departures,
      },
    ],
    default: [],
  },
});
export default mongoose.model("GewertzSquareUser", schema);
