import mongoose from "mongoose"
import { arrayObjectId, dataId } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    campId: dataId,
    partId: {
        type: mongoose.Schema.ObjectId
    },
    petoCampMemberCardIds:arrayObjectId,
    petoIds: arrayObjectId,
})
export default mongoose.model('PetoCamp', PeeCampSchema)