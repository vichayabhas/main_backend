import mongoose from "mongoose";
import { dataId, dataString, getDefaultBoolean } from "../controllers/setup";
import { campDictTypes } from "./interface";

const schema = new mongoose.Schema({
  key: dataString,
  value: dataString,
  types: {
    type: String,
    enum: campDictTypes,
    required: true,
  },
  parentId: dataId,
  canNongAccidentallySee: getDefaultBoolean(false),
  canNongSee: getDefaultBoolean(false),
});
export default mongoose.model("CampDict", schema);
