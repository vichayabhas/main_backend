import mongoose from "mongoose";
import { arrayObjectId, dataId } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
  campId: dataId,
  baanId: {
    type: mongoose.Schema.ObjectId,
  },
  nongIds: arrayObjectId,
  nongCampMemberCardIds: arrayObjectId,
});
export default mongoose.model("NongCamp", PeeCampSchema);
