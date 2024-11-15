import mongoose from "mongoose"
import { arrayObjectId, dataId, dataString } from "../controllers/setup"
const PartSchema = new mongoose.Schema({
    question: dataString,
    campId: dataId,
    answerIds: arrayObjectId,
    score: {
        type: Number,
        required: true,
    },
    order: {
        type: Number,
        required: true
    },

})
export default mongoose.model('TextQuestion', PartSchema)