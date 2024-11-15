import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { arrayObjectId, dataId, dataString } from '../controllers/setup';
const HospitalSchema = new mongoose.Schema({
    name:dataString,
    link: {
        type: String,
        default:null
    },
    status: {
        type: String,
        enum: ['not start', 'in process', 'done'],
        default: 'not start'
    },
    partId: dataId,
    linkOutIds: arrayObjectId,
    fromId: {
        type: mongoose.Schema.ObjectId,
        default:null
    },
    createBy:dataId,
    password:{
        type:String,
        required:[true,''],
        minlength: 2,
        
    },
    partName:{
        type:String
    }
});
HospitalSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next()
});
export default mongoose.model('WorkItem', HospitalSchema);