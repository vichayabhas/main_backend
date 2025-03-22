import mongoose from "mongoose";
import {
  dataDate,
  dataId,
  dataNumberReq,
  getDefaultBoolean,
} from "../controllers/setup";

const schema = new mongoose.Schema({
  itemId: dataId,
  time: dataDate,
  count: dataNumberReq,
  fromId: dataId,
  types: {
    type: String,
    required: true,
    enum: ["part", "baan"],
  },
  campMemberCardId: dataId,
  placeId: dataId,
  isComplete: getDefaultBoolean(false),
});
export default mongoose.model("Order", schema);
