import express from "express";
import {
  getActionPlans,
  getActionPlanByPartId,
  createActionPlan,
  getActionPlan,
  updateActionPlan,
  deleteActionPlan,
  getActionPlanByCampId,
} from "../controllers/camp/actionPlan";
import {
  nongRegister,
  staffRegister,
  interview,
  pass,
  sure,
  paid,
  addNong,
  addPee,
  kickPee,
  kickNong,
} from "../controllers/camp/admidsion";
import {
  getShowRegisters,
  getAllUserCamp,
  getAllWelfare,
  getAllPlanData,
  planUpdateCamp,
  plusActionPlan,
  getCoopData,
  getAllNongRegister,
  getRegisterData,
} from "../controllers/camp/authPart";
import { changeBaan, changePart } from "../controllers/camp/change";
import {
  getCamps,
  getCampName,
  getCamp,
  getNongCamp,
  getPeeCamp,
  getPetoCamp,
  getBaan,
  getPart,
  getPartName,
  getNongsFromBaanId,
  getPeesFromBaanId,
  getPeesFromPartId,
  getPetosFromPartId,
  getBaans,
  getParts,
  getNongCampData,
  getPeeCampData,
  getPetoCampData,
  getPartForUpdate,
  getCampState,
} from "../controllers/camp/getCampData";
import {
  editQuestion,
  getAllQuestion,
  deleteChoiceQuestion,
  deleteTextQuestion,
  peeAnswerQuestion,
  getAllAnswerAndQuestion,
  scoreTextQuestions,
} from "../controllers/camp/questionAndAnswer";
import {
  createWorkingItem,
  getWorkingItems,
  getWorkingItemByPartId,
  getWorkingItem,
  updateWorkingItem,
  deleteWorkingItem,
  getWorkingItemByCampId,
} from "../controllers/camp/trackingSheet";
import { protect, pee } from "../middleware/auth";
import {
  createImageAndDescriptionContainer,
  deleteImageAndDescryption,
  editImageAndDescription,
  getImageAndDescriptions,
} from "../controllers/camp/imageAndDescription";
import {
  createJob,
  updateJobAssign,
  registerJob,
  deleteBaanJob,
  deletPartJob,
} from "../controllers/camp/jobAssign";
import {
  createMirror,
  updateMirror,
  deleteMirror,
} from "../controllers/camp/mirror";

const router = express.Router();

router.get("/getCamps/", getCamps); //
router.get("/getCampName/params/:id", getCampName); //
router.get("/getCamp/params/:id", getCamp); //
router.get("/nongCamp/params/:id", getNongCamp); //
router.get("/peeCamp/params/:id", getPeeCamp); //
router.get("/PetoCamp/params/:id", getPetoCamp); //
router.get("/baan/params/:id", getBaan); //
router.get("/part/params/:id", getPart); //
router.get("/partName/params/:id", getPartName); //
router.post("/nongRegisterCamp/", protect, nongRegister); //
router.post("/staffRegisterCamp/params/:id", protect, pee, staffRegister); //
router.get("/getNongsFromBaanId/params/:id", getNongsFromBaanId); //
router.get("/getPeesFromBaanId/params/:id", getPeesFromBaanId); //
router.get("/getPeesFromPartId/params/:id", getPeesFromPartId); //
router.get("/getPetosFromPartId/params/:id", getPetosFromPartId); //
router.get("/getBaans/params/:id", getBaans); //
router.get("/getActionPlans/", protect, pee, getActionPlans); //
router.get(
  "/getActionPlanByPartId/params/:id",
  protect,
  pee,
  getActionPlanByPartId
); //
router.post("/createActionPlan/", protect, pee, createActionPlan); //
router.get("/getActionPlan/params/:id", protect, pee, getActionPlan); //
router.put("/updateActionPlan/params/:id", protect, pee, updateActionPlan); //
router.delete("/deleteActionPlan/params/:id", protect, pee, deleteActionPlan); //
router.post("/createWorkingItem/", protect, pee, createWorkingItem); //
router.get("/getWorkingItems/", protect, pee, getWorkingItems); //
router.get(
  "/getWorkingItemByPartId/params/:id",
  protect,
  getWorkingItemByPartId
); //
router.get("/getWorkingItem/params/:id", protect, pee, getWorkingItem); //
router.put("/updateWorkingItem/params/:id", protect, pee, updateWorkingItem); //
router.delete("/deleteWorkingItem/params/:id", protect, pee, deleteWorkingItem); //
router.get("/getShowRegisters/params/:id", protect, pee, getShowRegisters); //
router.post("/interview/", protect, pee, interview); //
router.post("/pass/", protect, pee, pass); //
router.post("/sure/", protect, pee, sure); //
router.post("/paid/params/:id", protect, paid); //
router.post("/add/nong/", protect, pee, addNong); //
router.post("/add/pee/", protect, pee, addPee); //
router.post("/kick/pee/", protect, pee, kickPee); //
router.post("/kick/nong/", protect, pee, kickNong); //
router.post("/changeBaan/", protect, pee, changeBaan); //
router.post("/changePart/", protect, pee, changePart); //
router.get("/getAllUserCamp/", protect, getAllUserCamp); //
router.get("/getAllWelfare/params/:id", getAllWelfare); //
router.get("/getAllPlanData/params/:id", getAllPlanData); //
router.put("/planUpdateCamp/", protect, planUpdateCamp); //
router.put("/editQuestion/", protect, editQuestion); //
router.get("/getAllQuestion/params/:id", protect, getAllQuestion); //
router.delete(
  "/deleteChoiceQuestion/params/:id",
  protect,
  deleteChoiceQuestion
); //
router.delete("/deleteTextQuestion/params/:id", protect, deleteTextQuestion); //
router.post("/plusActionPlan/", protect, plusActionPlan); //
router.post("/peeAnswerQuestion/", protect, peeAnswerQuestion); //
router.get(
  "/getAllAnswerAndQuestion/params/:id",
  protect,
  getAllAnswerAndQuestion
); //
router.post("/scoreTextQuestions/", protect, scoreTextQuestions); //
router.get("/getCoopData/params/:id", getCoopData); //
router.get("/getAllNongRegister/params/:id", protect, pee, getAllNongRegister); //
router.get("/getActionPlanByCampId/params/:id", protect, getActionPlanByCampId); //
router.get(
  "/getWorkingItemByCampId/params/:id",
  protect,
  getWorkingItemByCampId
); //
router.get("/getParts/params/:id", protect, getParts); //
router.get("/getNongCampData/params/:id", protect, getNongCampData); //
router.get("/getPeeCampData/params/:id", protect, getPeeCampData); //
router.get("/getPetoCampData/params/:id", protect, getPetoCampData); //
router.get("/getPartForUpdate/params/:id", getPartForUpdate); //
router.get("/getRegisterData/params/:id", getRegisterData); //
router.get("/getCampState/params/:id", protect, getCampState); //
router.post(
  "/createImageAndDescriptionContainer/",
  protect,
  createImageAndDescriptionContainer
); //
router.put("/editImageAndDescription/", protect, editImageAndDescription); //
router.delete(
  "/deleteImageAndDescryption/params/:id",
  protect,
  deleteImageAndDescryption
); //
router.get(
  "/getImageAndDescriptions/params/:id",
  protect,
  getImageAndDescriptions
); //
router.post("/createJob", protect, createJob); //
router.put("/updateJobAssign", protect, updateJobAssign); //
router.post("/registerJob", protect, registerJob); //
router.delete("/deleteBaanJob/params/:id", protect, deleteBaanJob); //
router.delete("/deletPartJob/params/:id", protect, deletPartJob); //
router.post("/createMirror/", protect, createMirror); //
router.put("/updateMirror/", protect, updateMirror); //
router.delete("/deleteMirror/params/:id", protect, deleteMirror); //
export default router;
