import mongoose from "mongoose"
import { dataId, dataNumber, dataString } from "../controllers/setup"
const PartSchema = new mongoose.Schema({
    answer: dataString,
    userId: dataId,
    questionId: dataId,
    score: dataNumber,
    containerId: dataId,
})
export default mongoose.model('TextAnswer', PartSchema)