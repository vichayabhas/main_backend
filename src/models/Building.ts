import mongoose from "mongoose";
import { arrayObjectId } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  placeIds: arrayObjectId,
  actionPlanIds: arrayObjectId,
  fridayActIds: arrayObjectId,
  lostAndFoundIds: arrayObjectId,
  boySleepBaanIds: arrayObjectId,
  girlSleepBaanIds: arrayObjectId,
  normalBaanIds: arrayObjectId,
  partIds: arrayObjectId,
});
export default mongoose.model("Building", PeeCampSchema);
