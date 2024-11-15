import mongoose from "mongoose"
import { arrayObjectId, dataString } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    name: dataString,
    placeIds: arrayObjectId,
    actionPlanIds: arrayObjectId,
    fridayActIds: arrayObjectId,
    lostAndFoundIds: arrayObjectId,
    boySleepBaanIds: arrayObjectId,
    girlSleepBaanIds: arrayObjectId,
    normalBaanIds: arrayObjectId,
    partIds: arrayObjectId,
})
export default mongoose.model('Building', PeeCampSchema)