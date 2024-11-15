import mongoose from "mongoose";
import { arrayObjectId, dataDate, dataId, dataMap, dataNumber, dataSize, dataString } from "../controllers/setup";

const campSchema = new mongoose.Schema({
    nameId: dataId,
    round: {
        type: Number,
        required: true,
    },
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
    dataLock: {
        type: Boolean,
        default: false
    },
    nongShirtSize: dataSize,
    peeShirtSize: dataSize,
    petoShirtSize: dataSize,
    nongModelIds: arrayObjectId,
    peeModelIds: arrayObjectId,
    petoModelIds: arrayObjectId,
    nongPendingIds: dataMap,
    nongPassIds: dataMap,
    open: {
        type: Boolean,
        default: false,
    },
    peePassIds: dataMap,
    songIds: arrayObjectId,
    nongSureIds: arrayObjectId,
    baanIds: arrayObjectId,
    nongCampMemberCardIds: arrayObjectId,
    peeCampMemberCardIds: arrayObjectId,
    petoCampMemberCardIds: arrayObjectId,
    link: {
        type: String
    },
    allDone: {
        type: Boolean,
        default: false
    },
    lockChangePickup: {
        type: Boolean,
        default: false
    },
    pictureUrls: {
        type: [String],
        default: []
    },
    campStyleId: {
        type: mongoose.Schema.ObjectId
    },
    actionPlanIds: arrayObjectId,
    workItemIds: arrayObjectId,
    nongPaidIds: arrayObjectId,
    nongInterviewIds: dataMap,
    registerModel: {
        type: String,
        enum: ['noPaid', 'noInterview', 'all'],
        required: true
    },
    lostAndFoundIds: arrayObjectId,
    memberStructure: {
        type: String,
        enum: ['nong->highSchool,pee->1year,peto->2upYear', 'nong->highSchool,pee->2upYear', 'nong->1year,pee->2upYear', 'nong->highSchool,pee->allYear', 'allYearMix'],
        require: true,
    },
    logoUrl: {
        type: String
    },
    mapCampMemberCardIdByUserId: dataMap,
    peeLock: {
        type: Boolean,
        default: false
    },
    registerSheetLink: {
        type: String,
        default: null
    },
    outRoundIds: arrayObjectId,
    campName: dataString,
    nongSleepIds: arrayObjectId,
    peeSleepIds: arrayObjectId,
    nongSleepModel: {
        type: String,
        enum: ['นอนทุกคน', 'เลือกได้ว่าจะค้างคืนหรือไม่', 'ไม่มีการค้างคืน'],
        required: true,
    },
    peeSleepModel: {
        type: String,
        enum: ['นอนทุกคน', 'เลือกได้ว่าจะค้างคืนหรือไม่', 'ไม่มีการค้างคืน'],
        required: true,
    },
    groupRefMap: dataMap,
    baanBoardId: {
        type: mongoose.Schema.ObjectId
    },
    partNameIds: arrayObjectId,
    ready: {
        type: [{
            type: String,
            enum: ['A', 'B', 'C', 'Dog', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T']
        }],
        default: []
    },
    partBoardId: {
        type: mongoose.Schema.ObjectId
    },
    partCoopId: {
        type: mongoose.Schema.ObjectId
    },
    partRegisterId: {
        type: mongoose.Schema.ObjectId
    },
    partPeeBaanId: {
        type: mongoose.Schema.ObjectId
    },
    groupName: {
        type: String,
        default: 'บ้าน'
    },
    peeDataLock: {
        type: Boolean,
        default: false
    },
    petoDataLock: {
        type: Boolean,
        default: false
    },
    haveCloth: {
        type: Boolean,
        default: true
    },
    actionPlanOffset: dataNumber,
    nongMapIdLtoG: dataMap,
    peeMapIdLtoG: dataMap,
    nongMapIdGtoL: dataMap,
    peeMapIdGtoL: dataMap,
    currentNong: dataNumber,
    currentPee: dataNumber,
    mdTime: {
        type: Date,
        default: new Date(Date.now())
    },
    partWelfareId: {
        type: mongoose.Schema.ObjectId
    },
    partMedId: {
        type: mongoose.Schema.ObjectId
    },
    partPlanId: {
        type: mongoose.Schema.ObjectId
    },
    allPetoChatIds: arrayObjectId,
    petoSleepIds: arrayObjectId,
    nongCampMemberCardHaveHeathIssueIds: arrayObjectId,
    peeCampMemberCardHaveHeathIssueIds: arrayObjectId,
    petoCampMemberCardHaveHeathIssueIds: arrayObjectId,
    nongHaveBottleIds: arrayObjectId,
    peeHaveBottleIds: arrayObjectId,
    petoHaveBottleIds: arrayObjectId,
    partPrStudioId: {
        type: mongoose.Types.ObjectId
    },
    choiceQuestionIds: arrayObjectId,
    textQuestionIds: arrayObjectId,
    nongAnswerPackIds: arrayObjectId,
    peeAnswerPackIds: arrayObjectId,
    mapAnswerPackIdByUserId: dataMap,
    peeAnswerIds: arrayObjectId,
    showCorrectAnswerAndScore: {
        type: Boolean,
        default: false,
    },
})
export default mongoose.model('Camp', campSchema)

















