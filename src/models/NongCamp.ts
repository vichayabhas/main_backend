import mongoose from "mongoose"
import { arrayObjectId, dataId, dataMap } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    campId: dataId,
    baanId: {
        type: mongoose.Schema.ObjectId
    },
    nongIds:arrayObjectId,
    nongCampMemberCardIds:arrayObjectId,
    mapNongCampIdByUserId: dataMap
})
export default mongoose.model('NongCamp', PeeCampSchema)