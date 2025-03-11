import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataNumberReq,
  dataString,
  getDafaultBoolean,
} from "../controllers/setup";
import {
  foodLimits,
  subGroupGenderTypes,
  subGroupRoleTypes,
} from "./interface";

const groupContainerSchema = new mongoose.Schema({
  genderType: {
    type: String,
    required: true,
    enum: subGroupGenderTypes,
  },
  roleType: {
    type: String,
    required: true,
    enum: subGroupRoleTypes,
  },
  containerId: dataId,
  limit: dataNumberReq,
  name: dataString,
  campMemberCardIds: arrayObjectId,
  isWearing: getDafaultBoolean(false),
  spicy: getDafaultBoolean(false),
  foodLimit: {
    type: String,
    enum: foodLimits,
    default: "ไม่มีข้อจำกัดด้านความเชื่อ",
  },
});
export default mongoose.model("SubGroupContainer", groupContainerSchema);
