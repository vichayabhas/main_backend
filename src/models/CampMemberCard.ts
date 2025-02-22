import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataNumber,
  getDafaultBoolean,
} from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
  userId: dataId,
  size: {
    type: String,
    enum: ["S", "M", "L", "XL", "XXL", "3XL"],
    required: true,
  },
  campModelId: dataId,
  role: {
    type: String,
    enum: ["nong", "pee", "peto"],
    required: true,
  },
  receive: {
    type: String,
    enum: ["baan", "part"],
    default: "baan",
  },
  received: dataNumber,
  haveBottle: getDafaultBoolean(false),
  sleepAtCamp: getDafaultBoolean(false),
  chatIds: arrayObjectId,
  allChatIds: arrayObjectId,
  ownChatIds: arrayObjectId,
  healthIssueId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  blackListFoodIds: arrayObjectId,
  whiteListFoodIds: arrayObjectId,
  baanJobIds: arrayObjectId,
  partJobIds: arrayObjectId,
  mirrorSenderIds: arrayObjectId,
  mirrorReciverIds: arrayObjectId,
  mirrorBaanIds: arrayObjectId,
});
export default mongoose.model("CampMemberCard", PeeCampSchema);
