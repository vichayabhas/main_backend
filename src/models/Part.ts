import mongoose from "mongoose";
import { arrayObjectId, dataId, dataMap, dataSize, dataString } from "../controllers/setup";
const PartSchema = new mongoose.Schema({
    nameId: dataId,
    campId: dataId,
    peeIds: {//user
        type: [mongoose.Schema.ObjectId],
        default: []
    },
    petoIds: arrayObjectId,
    peeHeathIssueIds: arrayObjectId,
    petoHeathIssueIds: arrayObjectId,
    peeShirtSize: dataSize,
    petoShirtSize: dataSize,
    peeModelIds: arrayObjectId,
    petoModelId: {
        type: mongoose.Schema.ObjectId
    },
    mapPeeCampIdByBaanId: dataMap,
    peeCampMemberCardIds: arrayObjectId,
    petoCampMemberCardIds: arrayObjectId,
    actionPlanIds: arrayObjectId,
    workItemIds: arrayObjectId,
    placeId: {
        type: mongoose.Schema.ObjectId
    },
    mapCampMemberCardIdByUserId: dataMap,
    partName: dataString,
    peeSleepIds: arrayObjectId,
    chatIds: arrayObjectId,
    isAuth: {
        type: Boolean,
        required: true
    },
    petoSleepIds: arrayObjectId,
    peeCampMemberCardHaveHeathIssueIds: arrayObjectId,
    petoCampMemberCardHaveHeathIssueIds: arrayObjectId,
    peeHaveBottleIds: arrayObjectId,
    petoHaveBottleIds: arrayObjectId,
})
export default mongoose.model('Part', PartSchema)