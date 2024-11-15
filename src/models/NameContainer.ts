import mongoose from "mongoose"
import { arrayObjectId } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    campIds: arrayObjectId,
    name: {
        type: String,
        unique:true,
        required:true,
    }
})
export default mongoose.model('NameContainer', PeeCampSchema)
