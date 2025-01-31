import mongoose from "mongoose";
import { dataString } from "../controllers/setup";
const LostAndFoundSchema = new mongoose.Schema({
  imageUrl: dataString,
  description: dataString,
  order: {
    type: Number,
    required: true,
  },
});
export default mongoose.model("ImageAndDescription", LostAndFoundSchema);
