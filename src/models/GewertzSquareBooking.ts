import mongoose from "mongoose";
import {
  dataDate,
  dataId,
  dataString,
  getDefaultBoolean,
} from "../controllers/setup";
import { gewertzSquareRoomTypes, userTypes } from "./interface";

const Schema = new mongoose.Schema({
  room: {
    type: String,
    enum: gewertzSquareRoomTypes,
    required: true,
  },
  userId: dataId,
  userType: {
    type: String,
    enum: userTypes,
    required: true,
  },
  tel: dataString,
  start: dataDate,
  end: dataDate,
  approved: getDefaultBoolean(false),
});
export default mongoose.model("GewertzSquareBooking", Schema);
