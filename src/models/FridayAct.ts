import mongoose from "mongoose";


const fridayActSchema = new mongoose.Schema({
    company: {
        type: String,
        require: [true, 'Plese fill company']
    },
    date: {
        type: Date
    },
    staffId: {//user
        type: [mongoose.Schema.ObjectId],
        default: []
    },
    limit: {
        type: Number
    },
    studentId: {//user
        type: [mongoose.Schema.ObjectId],
        default: []
    },
    placeId: {//place
        type: mongoose.Schema.ObjectId
    }
})
export default mongoose.model('FridayAct', fridayActSchema)