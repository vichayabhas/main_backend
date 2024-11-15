import mongoose from "mongoose"
import { arrayObjectId, dataId, dataNumber } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    userId: dataId,
    size: {
        type: String,
        enum: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
        required: true
    },
    campModelId:dataId,
    role: {
        type: String,
        enum: ['nong', 'pee', 'peto'],
        required: true,
    },
    receive: {
        type: String,
        enum: ['baan', 'part']
    },
    received: dataNumber,
    haveBottle: {
        type: Boolean,
        default: false
    },
    sleepAtCamp: {
        type: Boolean,
        default: false
    },
    chatIds: arrayObjectId,
    allChatIds: arrayObjectId,
    ownChatIds: arrayObjectId,
    healthIssueId: {
        type: mongoose.Schema.ObjectId,
        default: null,
    },
})
export default mongoose.model('CampMemberCard', PeeCampSchema)