import mongoose from "mongoose";
import { arrayObjectId, dataId, dataString } from "../controllers/setup";
import { imageAndDescriptionTypes } from "./interface";
const LostAndFoundSchema = new mongoose.Schema({
  baanId: dataId,
  childIds: arrayObjectId,
  types: {
    type: String,
    required: true,
    enum: imageAndDescriptionTypes,
  },
  name: dataString,
  mode: {
    type: String,
    required: true,
    enum: ["pee", "nong"],
  },
});
export default mongoose.model(
  "ImageAndDescriptionContainer",
  LostAndFoundSchema
);
