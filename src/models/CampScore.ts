import mongoose from "mongoose";
import { dataId, dataNumberReq } from "../controllers/setup";

const schema = new mongoose.Schema({
  campId: dataId,
  containerId: dataId,
  nongScore: dataNumberReq,
  peeScore: dataNumberReq,
  petoScore: dataNumberReq,
});
export default mongoose.model("CampScore", schema);
