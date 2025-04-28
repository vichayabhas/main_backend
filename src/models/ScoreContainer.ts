import mongoose from "mongoose";
import { arrayObjectId, dataString } from "../controllers/setup";

const schema = new mongoose.Schema({
  name: dataString,
  campScoreIds: arrayObjectId,
  shortActivityScoreIds: arrayObjectId,
});
export default mongoose.model("ScoreContainer", schema);
