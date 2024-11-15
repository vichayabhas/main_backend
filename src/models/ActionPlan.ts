import mongoose from "mongoose";
import { arrayObjectId, dataDate, dataId, dataString } from "../controllers/setup";
const HospitalSchema = new mongoose.Schema({
    action: dataString,
    partId: dataId,
    campId: dataId,
    placeIds: arrayObjectId,
    start:dataDate,
    end: dataDate,
    headId: dataId,
    body: {
        type: String,
        default: ''
    },
    partName: dataString,
});
export default mongoose.model('ActionPlan', HospitalSchema);