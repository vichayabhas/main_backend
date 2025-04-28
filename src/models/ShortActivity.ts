import mongoose from "mongoose";
import {
  arrayObjectId,
  dataDate,
  dataId,
  dataNumberReq,
  dataString,
} from "../controllers/setup";

const schema = new mongoose.Schema({
  limit: dataNumberReq,
  name: dataString,
  participantIds: arrayObjectId,
  studentStaffIds: arrayObjectId,
  scoreIds: arrayObjectId,
  universityStaffIds: arrayObjectId,
  imageLink: dataString,
  time: dataDate,
  placeId: dataId,
});
export default mongoose.model("ShortActivity", schema);
