import mongoose from "mongoose";
import { dataId, dataNumber } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
    userId:dataId,
    day: dataNumber,
    hour:dataNumber,
    minute:dataNumber,
})
export default mongoose.model('TimeOffset', PeeCampSchema)