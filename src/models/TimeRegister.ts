import mongoose from "mongoose";
import { dataId } from "../controllers/setup";

const timeRegisterSchema = new mongoose.Schema({
  refId: dataId,
  time: {
    type: Date,
    default: new Date(Date.now()),
  },
  campMemberCardId: dataId,
});
export default mongoose.model("TimeRegister", timeRegisterSchema);
