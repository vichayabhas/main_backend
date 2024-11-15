import mongoose from "mongoose";
const PeeCampSchema = new mongoose.Schema({
    name:{
        type:String
    }
})
export default mongoose.model('ChronicDisease', PeeCampSchema)