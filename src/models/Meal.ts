import mongoose from "mongoose";
import { arrayObjectId, dataDate, dataId } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
    time: dataDate,
    campId: dataId,
    foodIds: arrayObjectId,
    roles: {
        type: [{
            type: String,
            enum: ['pee','nong','peto']
        }],
        default: []
    },
    isWhiteList: {
        type: Boolean,
        required: true,
    },
})
export default mongoose.model('Meals', PeeCampSchema)
