import mongoose from "mongoose";
import { arrayObjectId, dataId, dataNumberReq, dataString } from "../controllers/setup";
const PartSchema = new mongoose.Schema({
  question: dataString,
  campId: dataId,
  answerIds: arrayObjectId,
  score: dataNumberReq,
  order: dataNumberReq,
});
export default mongoose.model("TextQuestion", PartSchema);
