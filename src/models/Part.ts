import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataMapObjectId,
  dataSize,
  dataString,
} from "../controllers/setup";
import { authTypes } from "./interface";
const PartSchema = new mongoose.Schema({
  nameId: dataId,
  campId: dataId,
  peeIds: {
    //user
    type: [mongoose.Schema.ObjectId],
    default: [],
  },
  petoIds: arrayObjectId,
  peeHeathIssueIds: arrayObjectId,
  petoHeathIssueIds: arrayObjectId,
  peeShirtSize: dataSize,
  petoShirtSize: dataSize,
  peeModelIds: arrayObjectId,
  petoModelId: {
    type: mongoose.Schema.ObjectId,
  },
  mapPeeCampIdByBaanId: dataMapObjectId,
  peeCampMemberCardIds: arrayObjectId,
  petoCampMemberCardIds: arrayObjectId,
  actionPlanIds: arrayObjectId,
  workItemIds: arrayObjectId,
  placeId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  mapCampMemberCardIdByUserId: dataMapObjectId,
  partName: dataString,
  peeSleepIds: arrayObjectId,
  chatIds: arrayObjectId,
  petoSleepIds: arrayObjectId,
  peeCampMemberCardHaveHeathIssueIds: arrayObjectId,
  petoCampMemberCardHaveHeathIssueIds: arrayObjectId,
  peeHaveBottleIds: arrayObjectId,
  petoHaveBottleIds: arrayObjectId,
  auths: {
    type: [
      {
        type: String,
        enum: authTypes,
      },
    ],
    default: [],
  },
});
export default mongoose.model("Part", PartSchema);
