import mongoose from "mongoose";
import { dataId, dataNumberReq, dataString } from "../controllers/setup";
import {
  gewertzSquareAvailableTimes,
  gewertzSquareRoomTypes,
  userTypes,
} from "./interface";

const Schema = new mongoose.Schema({
  day: dataNumberReq,
  month: dataNumberReq,
  year: dataNumberReq,
  time: {
    type: Number,
    enum: gewertzSquareAvailableTimes,
    required: true,
  },
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
  period: dataNumberReq,
});
export default mongoose.model("GewertzSquareBooking", Schema);
