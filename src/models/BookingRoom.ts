import mongoose from "mongoose";
import { dataDate, dataId, getDefaultBoolean } from "../controllers/setup";
import { userTypes } from "./interface";

const schema = new mongoose.Schema({
  userId: dataId,
  userType: {
    type: String,
    enum: userTypes,
    required: true,
  },
  placeId: dataId,
  time: dataDate,
  isApprove: getDefaultBoolean(false),
});
export default mongoose.model("BookingRoom", schema);
