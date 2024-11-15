import mongoose from "mongoose"
import { arrayObjectId } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    campIds: arrayObjectId,
    name: {
        type: String,
        required:true,
    },
    partIds: arrayObjectId,
})  
export default mongoose.model('PartNameContainer', PeeCampSchema)