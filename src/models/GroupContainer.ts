import mongoose from "mongoose";
import { arrayObjectId, dataId, dataString } from "../controllers/setup";
import { groupGenderTypes, groupRoleTypes } from "./interface";

const groupContainerSchema = new mongoose.Schema({
  baanId: dataId,
  subGroupIds: arrayObjectId,
  genderType: {
    type: String,
    required: true,
    enum: groupGenderTypes,
  },
  roleType: {
    type: String,
    required: true,
    enum: groupRoleTypes,
  },
  canAnybodyCreateSubGroup: {
    type: Boolean,
    required: true,
  },
  isDefault: {
    type: Boolean,
    required: true,
  },
  name: dataString,
  userIds: arrayObjectId,
});
export default mongoose.model("GroupContainer", groupContainerSchema);
