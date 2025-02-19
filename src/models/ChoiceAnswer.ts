import mongoose from "mongoose";
import { dataId, dataNumberReq } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
  userId: dataId,
  campId: dataId,
  questionId: dataId,
  answer: {
    type: String,
    enum: ["A", "B", "C", "D", "E", "-"],
    required: true,
  },
  score: dataNumberReq,
  containerId: dataId,
});
export default mongoose.model("ChoiceAnswer", PeeCampSchema);
