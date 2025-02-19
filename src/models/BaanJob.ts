import mongoose from "mongoose";
import { arrayObjectId, dataId } from "../controllers/setup";
const HospitalSchema = new mongoose.Schema({
  baanId: dataId,
  jobId: dataId,
  memberIds: arrayObjectId,
  userIds: arrayObjectId,
});
export default mongoose.model("BaanJob", HospitalSchema);
