import mongoose from "mongoose"
import { arrayObjectId, dataId, dataNumber, dataString } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    buildingId: dataId,
    floor: dataString,
    room: dataString,
    actionPlanIds: arrayObjectId,
    fridayActIds: arrayObjectId,
    boySleepBaanIds: arrayObjectId,
    girlSleepBaanIds: arrayObjectId,
    normalBaanIds: arrayObjectId,
    sleepCap: dataNumber,
    actCap: dataNumber,
    studyCap: dataNumber,
    lostAndFoundIds: arrayObjectId,
    partIds: arrayObjectId,
})
export default mongoose.model('Place', PeeCampSchema)