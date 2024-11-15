import mongoose from "mongoose"
import { arrayObjectId, dataId, dataMap } from "../controllers/setup"
const PeeCampSchema = new mongoose.Schema({
    campId:dataId,
    partId:dataId,
    baanId:dataId,
    peeIds:arrayObjectId,
    peeCampMemberCardIds: arrayObjectId,
    arrayString1: {
        type: [String],
        default: []
    },
    arrayString2: {
        type: [String],
        default: []
    },
    arrayString3: {
        type: [String],
        default: []
    },
    arrayString4: {
        type: [String],
        default: []
    },
    arrayString5: {
        type: [String],
        default: []
    },
    map1: dataMap,
    map2: dataMap,
    map3: dataMap,
    map4: dataMap,
    map5: dataMap,
    mapArrayStringNumberByName: dataMap,
    mapMapNumberByName:dataMap,
    varibleNames: {
        type: [String],
        default: ['arrayString1', 'arrayString2', 'arrayString3', 'arrayString4', 'arrayString5', 'map1', 'map2', 'map3', 'map4', 'map5']
    },
})
export default mongoose.model('PeeCamp', PeeCampSchema)