import mongoose from "mongoose";
import { arrayObjectId, dataNumberReq, dataString } from "../controllers/setup";
const PartSchema = new mongoose.Schema({
  name: dataString,
  campIds: arrayObjectId,
  baanIds: arrayObjectId,
  author: dataString,
  time:dataNumberReq,
  link: dataString,
  userLikeIds: arrayObjectId,
});
export default mongoose.model("Song", PartSchema);
