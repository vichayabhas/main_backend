import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataNumber,
  dataString,
  getDefaultBoolean,
} from "../controllers/setup";

const schema = new mongoose.Schema({
  name: dataString,
  orderIds: arrayObjectId,
  campId: dataId,
  remain: dataNumber,
  canNongOrder: getDefaultBoolean(false),
  imageLink: {
    type: String,
    default: null,
  },
  canNongSee: getDefaultBoolean(false),
});
export default mongoose.model("Item", schema);
