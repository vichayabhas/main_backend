import mongoose from "mongoose";
import { dataId, dataString, getDafaultBoolean } from "../controllers/setup";
const PartSchema = new mongoose.Schema({
  campId: dataId,
  appId: dataString,
  key: dataString,
  secret: dataString,
  cluster: dataString,
  useTLS: getDafaultBoolean(true),
});
PartSchema.pre('save', function(){
    this.useTLS = true;
});
export default mongoose.model("PusherData", PartSchema);
