import mongoose from "mongoose";
import { dataId, dataNumberReq } from "../controllers/setup";

const schema = new mongoose.Schema({
  shortActivityId: dataId,
  containerId: dataId,
  staffScore: dataNumberReq,
  participantScore: dataNumberReq,
});
export default mongoose.model("ShortActivityScore", schema);
