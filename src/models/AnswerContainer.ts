import mongoose from "mongoose"
import { arrayObjectId, dataId } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    choiceAnswerIds: arrayObjectId,
    textAnswerIds: arrayObjectId,
    campId: dataId,
    userId: dataId,
    role: {
        type: String,
        enum: ['nong', 'pee', 'peto'],
        required: true,
    },
})
export default mongoose.model('AnswerContainer', PeeCampSchema)