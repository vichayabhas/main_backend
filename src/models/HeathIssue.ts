import mongoose from "mongoose";
import { foodLimits } from "./interface";
import { arrayObjectId, dataId } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
    userId:dataId,
    food: {
        type: String,
        default: ''
    },
    chronicDisease: {
        type: String,
        default: ''
    },
    medicine: {
        type: String,
        default: ''
    },
    extra: {
        type: String,
        default: ''
    },
    isWearing: {
        type: Boolean,
        default: false
    },
    spicy: {
        type: Boolean,
        default: false
    },
    foodConcern: {
        type: String,
        default: ''
    },
    campIds:arrayObjectId,
    campMemberCardIds: arrayObjectId,
    foodLimit:{
        type:String,
        enum:foodLimits,
        default:'ไม่มีข้อจำกัดด้านความเชื่อ'
    }
})
export default mongoose.model('HelthIsue', PeeCampSchema)