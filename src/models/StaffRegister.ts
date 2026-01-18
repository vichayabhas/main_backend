import mongoose from "mongoose";
import { dataId, dataNumberReq, dataString } from "../controllers/setup";

const schema = new mongoose.Schema({
  userId: dataId,
  partId: dataId,
  link: dataString,
  rank: dataNumberReq,
});
export default mongoose.model("StaffRegister", schema);
