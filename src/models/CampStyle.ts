import mongoose from "mongoose"
const PeeCampSchema = new mongoose.Schema({
    refId: {//camp
        type: mongoose.Schema.ObjectId
    },
    types: {
        type: String,
        enum: ['camp', 'baan']
    }
})
export default mongoose.model('CampStyle', PeeCampSchema)