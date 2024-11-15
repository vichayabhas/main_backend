import mongoose from "mongoose";
import { dataId, dataString } from "../controllers/setup";
const LostAndFoundSchema = new mongoose.Schema({
    campId: {
        type: mongoose.Schema.ObjectId,
        default:null
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required:true
    },
    name: dataString,
    detail: {
        type: String,
        required:true
    },
    userId: dataId,
    placeId: {
        type: mongoose.Schema.ObjectId,
        //required:true,
        default:null
    },
    buildingId: {
        type: mongoose.Schema.ObjectId,
       // required:true,
        default:null
    }
})
export default mongoose.model('LostAndFound', LostAndFoundSchema)