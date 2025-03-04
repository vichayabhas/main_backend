import mongoose from "mongoose";
import {
  arrayObjectId,
  dataId,
  dataNumberReq,
  dataString,
} from "../controllers/setup";
import { subGroupGenderTypes, subGroupRoleTypes } from "./interface";

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
});
export default mongoose.model("SubGroupContainer", groupContainerSchema);
