import mongoose from "mongoose";
import { arrayObjectId, dataId, dataString } from "../controllers/setup";
const HospitalSchema = new mongoose.Schema({
  name: dataString,
  link: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["not start", "in process", "done"],
    default: "not start",
  },
  partId: dataId,
  linkOutIds: arrayObjectId,
  fromId: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  createBy: dataId,
  password: {
    type: String,
    required: [true, ""],
    minlength: 2,
  },
  partName: dataString,
});
export default mongoose.model("WorkItem", HospitalSchema);
