import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataString,
  getDafaultBoolean,
} from "../controllers/setup";
import { foodLimits } from "./interface";
const PeeCampSchema = new mongoose.Schema({
  campId: dataId,
  isWhiteList: getDafaultBoolean(true),
  peeIds: arrayObjectId,
  nongIds: arrayObjectId,
  petoIds: arrayObjectId,
  nongHeathIssueIds: arrayObjectId,
  peeHeathIssueIds: arrayObjectId,
  petoHeathIssueIds: arrayObjectId,
  nongCampMemberCardIds: arrayObjectId,
  peeCampMemberCardIds: arrayObjectId,
  petoCampMemberCardIds: arrayObjectId,
  name: dataString,
  mealId: dataId,
  lists: {
    type: [
      {
        type: String,
        enum: foodLimits,
      },
    ],
    default: [],
  },
  isSpicy: getDafaultBoolean(true),
  listPriority: getDafaultBoolean(true),
});
export default mongoose.model("Food", PeeCampSchema);
