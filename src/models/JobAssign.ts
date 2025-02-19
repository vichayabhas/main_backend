import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataNumberReq,
  dataString,
} from "../controllers/setup";
import { jobGenderRequies } from "./interface";
const LostAndFoundSchema = new mongoose.Schema({
  types: {
    type: String,
    required: true,
    enum: ["baan", "part"],
  },
  refId: dataId,
  name: dataString,
  reqType: {
    type: String,
    required: true,
    enum: jobGenderRequies,
  },
  memberIds: arrayObjectId,
  male: dataNumberReq,
  female: dataNumberReq,
  sum: dataNumberReq,
  userIds: arrayObjectId,
});
export default mongoose.model("JobAssign", LostAndFoundSchema);
