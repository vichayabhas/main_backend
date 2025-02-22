import mongoose from "mongoose";
import { dataId, dataString } from "../controllers/setup";

const mirrorSchema = new mongoose.Schema({
  senderCampMemberCardId: dataId,
  reciverId: dataId,
  message: dataString,
  types: {
    type: String,
    required: true,
    enum: ["baan", "user"],
  },
  time: {
    type: Date,
    default: new Date(Date.now()),
  },
});
export default mongoose.model("Mirror", mirrorSchema);
