import mongoose from "mongoose";
import { arrayObjectId, dataId, dataNumber, dataString } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
    campId: dataId,
    question: dataString,
    a: dataString,
    b: dataString,
    c: dataString,
    d: dataString,
    e: dataString,
    scoreA: {
        type: Number,
        required: true
    },
    scoreB: {
        type: Number,
        required: true
    },
    scoreC: {
        type: Number,
        required: true
    },
    scoreD: {
        type: Number,
        required: true
    },
    scoreE: {
        type: Number,
        required: true
    },
    nongAnswerA: dataNumber,
    nongAnswerB: dataNumber,
    nongAnswerC: dataNumber,
    nongAnswerD: dataNumber,
    nongAnswerE: dataNumber,
    peeAnswerA: dataNumber,
    peeAnswerB: dataNumber,
    peeAnswerC: dataNumber,
    peeAnswerD: dataNumber,
    peeAnswerE: dataNumber,
    correct: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D', 'E', '-']
    },
    order: {
        type: Number,
        required: true
    },
    answerIds:arrayObjectId,
})
export default mongoose.model('ChoiceQuestion', PeeCampSchema)