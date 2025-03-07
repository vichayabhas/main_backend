import mongoose from "mongoose";
import {
  arrayObjectId,
  dataDate,
  dataId,
  dataMapObjectId,
  dataMapString,
  dataNumber,
  dataNumberReq,
  dataSize,
  dataString,
  getDafaultBoolean,
} from "../controllers/setup";

const campSchema = new mongoose.Schema({
  nameId: dataId,
  round: dataNumberReq,
  dateStart: dataDate,
  dateEnd: dataDate,
  boardIds: arrayObjectId,
  peeIds: arrayObjectId,
  nongIds: arrayObjectId,
  partIds: arrayObjectId,
  petoIds: arrayObjectId,
  authorizeIds: arrayObjectId,
  nongHeathIssueIds: arrayObjectId,
  peeHeathIssueIds: arrayObjectId,
  petoHeathIssueIds: arrayObjectId,
  nongDataLock: getDafaultBoolean(false),
  nongShirtSize: dataSize,
  peeShirtSize: dataSize,
  petoShirtSize: dataSize,
  nongModelIds: arrayObjectId,
  peeModelIds: arrayObjectId,
  petoModelIds: arrayObjectId,
  nongPendingIds: dataMapString,
  nongPassIds: dataMapString,
  open: {
    type: Boolean,
    default: false,
  },
  peePassIds: dataMapObjectId,
  songIds: arrayObjectId,
  nongSureIds: arrayObjectId,
  baanIds: arrayObjectId,
  nongCampMemberCardIds: arrayObjectId,
  peeCampMemberCardIds: arrayObjectId,
  petoCampMemberCardIds: arrayObjectId,
  link: {
    type: String,
    default: null,
  },
  allDone: getDafaultBoolean(false),
  lockChangePickup: {
    type: Boolean,
    default: false,
  },
  pictureUrls: {
    type: [String],
    default: [],
  },
  campStyleId: {
    type: mongoose.Schema.ObjectId,
  },
  actionPlanIds: arrayObjectId,
  workItemIds: arrayObjectId,
  nongPaidIds: arrayObjectId,
  nongInterviewIds: dataMapString,
  registerModel: {
    type: String,
    enum: ["noPaid", "noInterview", "all"],
    required: true,
  },
  lostAndFoundIds: arrayObjectId,
  memberStructure: {
    type: String,
    enum: [
      "nong->highSchool,pee->1year,peto->2upYear",
      "nong->highSchool,pee->2upYear",
      "nong->1year,pee->2upYear",
      "nong->highSchool,pee->allYear",
      "allYearMix",
    ],
    required: true,
  },
  logoUrl: {
    type: String,
    default: null,
  },
  mapCampMemberCardIdByUserId: dataMapObjectId,
  peeLock: getDafaultBoolean(false),
  registerSheetLink: {
    type: String,
    default: null,
  },
  outRoundIds: arrayObjectId,
  campName: dataString,
  nongSleepIds: arrayObjectId,
  peeSleepIds: arrayObjectId,
  nongSleepModel: {
    type: String,
    enum: ["นอนทุกคน", "เลือกได้ว่าจะค้างคืนหรือไม่", "ไม่มีการค้างคืน"],
    required: true,
  },
  peeSleepModel: {
    type: String,
    enum: ["นอนทุกคน", "เลือกได้ว่าจะค้างคืนหรือไม่", "ไม่มีการค้างคืน"],
    required: true,
  },
  groupRefMap: dataMapObjectId,
  baanBoardId: {
    type: mongoose.Schema.ObjectId,
  },
  partNameIds: arrayObjectId,
  ready: {
    type: [
      {
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
        ],
      },
    ],
    default: [],
  },
  partBoardId: {
    type: mongoose.Schema.ObjectId,
  },
  partPeeBaanId: {
    type: mongoose.Schema.ObjectId,
  },
  groupName: {
    type: String,
    default: "บ้าน",
  },
  peeDataLock: getDafaultBoolean(false),
  petoDataLock: getDafaultBoolean(false),
  haveCloth: getDafaultBoolean(true),
  actionPlanOffset: dataNumber,
  nongMapIdLtoG: dataMapObjectId,
  peeMapIdLtoG: dataMapObjectId,
  nongMapIdGtoL: {
    type: Map,
    default: new Map(),
    of: Number,
  },
  peeMapIdGtoL: {
    type: Map,
    default: new Map(),
    of: Number,
  },
  currentNong: dataNumber,
  currentPee: dataNumber,
  mdTime: {
    type: Date,
    default: new Date(Date.now()),
  },
  allPetoChatIds: arrayObjectId,
  petoSleepIds: arrayObjectId,
  nongCampMemberCardHaveHeathIssueIds: arrayObjectId,
  peeCampMemberCardHaveHeathIssueIds: arrayObjectId,
  petoCampMemberCardHaveHeathIssueIds: arrayObjectId,
  nongHaveBottleIds: arrayObjectId,
  peeHaveBottleIds: arrayObjectId,
  petoHaveBottleIds: arrayObjectId,
  choiceQuestionIds: arrayObjectId,
  textQuestionIds: arrayObjectId,
  nongAnswerPackIds: arrayObjectId,
  peeAnswerPackIds: arrayObjectId,
  mapAnswerPackIdByUserId: dataMapObjectId,
  peeAnswerIds: arrayObjectId,
  showCorrectAnswerAndScore: getDafaultBoolean(false),
  canAnswerTheQuestion: getDafaultBoolean(false),
  mealIds: arrayObjectId,
  foodIds: arrayObjectId,
  canNongSeeAllAnswer: getDafaultBoolean(false),
  canNongSeeAllActionPlan: getDafaultBoolean(false),
  canNongSeeAllTrackingSheet: getDafaultBoolean(false),
  canNongAccessDataWithRoleNong: getDafaultBoolean(false),
  lockChangeQuestion: getDafaultBoolean(false),
  jobIds: arrayObjectId,
  canReadTimeOnMirror: getDafaultBoolean(false),
  nongCall: {
    type: String,
    default: "น้องค่าย",
  },
});
export default mongoose.model("Camp", campSchema);
