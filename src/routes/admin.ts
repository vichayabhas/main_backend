import express from "express";
import {
  addCampName,
  addPartName,
  saveDeleteCamp,
} from "../controllers/admin/delete";
import {
  getCampNames,
  createCamp,
  getPartNames,
  updateCamp,
  addBaan,
  updatePart,
  getAllRemainPartName,
  addPart,
  createBaanByGroup,
  updateBaan,
  afterVisnuToPee,
  peeToPeto,
  getCampForUpdate,
} from "../controllers/admin/main";
import { protect, admin, pee } from "../middleware/auth";

const router = express.Router();
router.get("/getCampNames/", getCampNames); //
router.post("/createCamp/", protect, admin, createCamp); //
router.post("/addCampName/params/:id", protect, admin, addCampName); //
router.get("/getPartNames/", getPartNames); //
router.post("/addPartName/params/:id", addPartName); //
router.put("/updateCamp/params/:id", protect, updateCamp); //
router.post("/addBaan/", protect, addBaan); //
router.put("/updatePart/", protect, updatePart); //
router.get(
  "/getAllRemainPartName/params/:id",
  protect,
  pee,
  getAllRemainPartName
); //
router.post("/addPart/", protect, addPart); //
router.post("/createBaanByGroup/params/:id", protect, createBaanByGroup); //
router.put("/updateBaan/", protect, updateBaan); //
router.delete("/saveDeleteCamp/params/:id", protect, saveDeleteCamp); //
router.post("/afterVisnuToPee/", protect, admin, afterVisnuToPee); //
router.post("/peeToPeto/", protect, admin, peeToPeto); //
router.get("/getCampForUpdate/params/:id", getCampForUpdate); //
export default router;
