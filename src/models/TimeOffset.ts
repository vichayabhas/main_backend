import mongoose from "mongoose";
import { dataNumber } from "../controllers/setup";
const PeeCampSchema = new mongoose.Schema({
  day: dataNumber,
  hour: dataNumber,
  minute: dataNumber,
});
export default mongoose.model("TimeOffset", PeeCampSchema);
