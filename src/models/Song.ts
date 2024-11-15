import mongoose from "mongoose"
import { arrayObjectId, dataString } from "../controllers/setup"
const PartSchema = new mongoose.Schema({
    name: dataString,
    campIds:arrayObjectId,
    baanIds: arrayObjectId,
    author: dataString,
    time: {
        type: Number,
        require: true,
    },
    link: dataString,
    userLikeIds: arrayObjectId,
})
export default mongoose.model('Song', PartSchema)