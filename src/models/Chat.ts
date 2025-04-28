import mongoose from "mongoose";
import { typeChats } from "./interface";
import { arrayObjectId, dataId, dataString } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
  message: dataString,
  userId: dataId,
  campModelId: dataId,
  role: {
    type: String,
    enum: ["pee", "peto", "nong"],
    required: true,
  },
  typeChat: {
    type: String,
    enum: typeChats,
    required: true,
  },
  refId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  campMemberCardIds: arrayObjectId,
  date: {
    type: Date,
    default: new Date(Date.now()),
  },
});
export default mongoose.model("Chat", PeeCampSchema);
