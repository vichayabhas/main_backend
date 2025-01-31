import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataMapObjectId,
  dataSize,
  dataString,
} from "../controllers/setup";
const BaanSchema = new mongoose.Schema({
  name: dataString,
  fullName: dataString,
  campId: dataId,
  peeIds: arrayObjectId,
  nongIds: arrayObjectId,
  nongHeathIssueIds: arrayObjectId,
  peeHeathIssueIds: arrayObjectId,
  nongShirtSize: dataSize,
  peeShirtSize: dataSize,
  songIds: arrayObjectId,
  mapPeeCampIdByPartId: dataMapObjectId,
  peeModelIds: arrayObjectId,
  nongModelId: {
    type: mongoose.Schema.ObjectId,
  },
  nongCampMemberCardIds: arrayObjectId,
  peeCampMemberCardIds: arrayObjectId,
  link: {
    type: String,
    default: null,
  },
  styleId: {
    type: mongoose.Schema.ObjectId,
  },
  boySleepPlaceId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  girlSleepPlaceId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  normalPlaceId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  mapCampMemberCardIdByUserId: dataMapObjectId,
  groupRef: {
    type: String,
    enum: [
      "A",
      "B",
      "C",
      "Dog",
      "E",
      "F",
      "G",
      "H",
      "J",
      "K",
      "L",
      "M",
      "N",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "null",
    ],
    default: "null",
  },
  nongSleepIds: arrayObjectId,
  peeSleepIds: arrayObjectId,
  chatIds: arrayObjectId,
  mdTime: {
    type: Date,
    default: new Date(Date.now()),
  },
  peeChatIds: arrayObjectId,
  nongChatIds: arrayObjectId,
  nongSendMessage: {
    type: Boolean,
    default: false,
  },
  nongCampMemberCardHaveHeathIssueIds: arrayObjectId,
  peeCampMemberCardHaveHeathIssueIds: arrayObjectId,
  nongHaveBottleIds: arrayObjectId,
  peeHaveBottleIds: arrayObjectId,
  imageAndDescriptionContainerIds: arrayObjectId,
  //679c85620cfba8def1ffb156
  //679c85690cfba8def1ffb162
});
export default mongoose.model("Baan", BaanSchema);
