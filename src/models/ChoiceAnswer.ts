import mongoose from "mongoose";
import { dataId } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
    userId: dataId,
    campId: dataId,
    questionId: dataId,
    answer: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'E', '-'],
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    containerId: dataId,
})
export default mongoose.model('ChoiceAnswer', PeeCampSchema)