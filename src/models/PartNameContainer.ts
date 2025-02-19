import mongoose from "mongoose";
import { arrayObjectId, dataString } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
  campIds: arrayObjectId,
  name: dataString,
  partIds: arrayObjectId,
});
export default mongoose.model("PartNameContainer", PeeCampSchema);
