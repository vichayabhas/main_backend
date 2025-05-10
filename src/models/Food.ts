import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataString,
  getDefaultBoolean,
} from "../controllers/setup";
import { foodLimits } from "./interface";
const PeeCampSchema = new mongoose.Schema({
  campId: dataId,
  isWhiteList: getDefaultBoolean(true),
  // peeIds: arrayObjectId,
  // nongIds: arrayObjectId,
  // petoIds: arrayObjectId,
  // nongHeathIssueIds: arrayObjectId,
  // peeHeathIssueIds: arrayObjectId,
  // petoHeathIssueIds: arrayObjectId,
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
  isSpicy: getDefaultBoolean(true),
  listPriority: getDefaultBoolean(true),
});
export default mongoose.model("Food", PeeCampSchema);
