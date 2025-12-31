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
  peeIds: arrayObjectId,
  petoIds: arrayObjectId,
  peeHealthIssueIds: arrayObjectId,
  petoHealthIssueIds: arrayObjectId,
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
  peeCampMemberCardHaveHealthIssueIds: arrayObjectId,
  petoCampMemberCardHaveHealthIssueIds: arrayObjectId,
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
  jobIds: arrayObjectId,
  orderIds: arrayObjectId,
});
export default mongoose.model("Part", PartSchema);
