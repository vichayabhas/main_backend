import express from "express";
import {
  getActionPlans,
  getActionPlanByPartId,
  createActionPlan,
  getActionPlan,
  updateActionPlan,
  deleteActionPlan,
  getActionPlanByCampId,
  getActionPlanForEdit,
} from "../controllers/camp/actionPlan";
import {
  nongRegister,
  interview,
  pass,
  sure,
  paid,
  addNong,
  addPee,
  kickPee,
  kickNong,
  addStaffToCamp,
  updateStaffRegister,
  staffRegisterCamp,
} from "../controllers/camp/admission";
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
  getOverrideHealthIssue,
  updateOverrideHealthIssue,
  getAuthPartForPage,
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
  getDataForStaffUpdateRegister,
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
  deleteImageAndDescription,
  editImageAndDescription,
  getImageAndDescriptions,
} from "../controllers/camp/imageAndDescription";
import {
  createJob,
  updateJobAssign,
  registerJob,
  deleteBaanJob,
  deletePartJob,
} from "../controllers/camp/jobAssign";
import {
  createGroupContainer,
  createSubGroup,
  updateGroupContainer,
  updateSubGroup,
  deleteGroupContainer,
  deleteSubGroup,
  getGroupContainerForAdmin,
  registerGroup,
  createSubGroupByAnyone,
  updateSubGroupByAnyone,
} from "../controllers/camp/subGroup";
import {
  createMirrorUser,
  updateMirrorUser,
  deleteMirrorUser,
  createMirrorBaan,
  updateMirrorBaan,
  deleteMirrorBaan,
} from "../controllers/camp/mirror";
import {
  createItem,
  createOrder,
  updateItem,
  deleteItem,
  deleteOrder,
  getOrderForAdmin,
  completeOrder,
} from "../controllers/camp/order";
import {
  createCampDict,
  deleteCampDict,
  getBaanDictsForUpdate,
  getCampDictsForUpdate,
  getPartDictsForUpdate,
  updateCampDict,
} from "../controllers/camp/campDict";
//import { registerGroup } from "../controllers/camp/น้องแสน";

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
router.post("/staffRegisterCamp/", protect, pee, staffRegisterCamp); //
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
  getActionPlanByPartId,
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
  getWorkingItemByPartId,
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
  deleteChoiceQuestion,
); //
router.delete("/deleteTextQuestion/params/:id", protect, deleteTextQuestion); //
router.post("/plusActionPlan/", protect, plusActionPlan); //
router.post("/peeAnswerQuestion/", protect, peeAnswerQuestion); //
router.get(
  "/getAllAnswerAndQuestion/params/:id",
  protect,
  getAllAnswerAndQuestion,
); //
router.post("/scoreTextQuestions/", protect, scoreTextQuestions); //
router.get("/getCoopData/params/:id", getCoopData); //
router.get("/getAllNongRegister/params/:id", protect, pee, getAllNongRegister); //
router.get("/getActionPlanByCampId/params/:id", protect, getActionPlanByCampId); //
router.get(
  "/getWorkingItemByCampId/params/:id",
  protect,
  getWorkingItemByCampId,
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
  createImageAndDescriptionContainer,
); //
router.put("/editImageAndDescription/", protect, editImageAndDescription); //
router.delete(
  "/deleteImageAndDescription/params/:id",
  protect,
  deleteImageAndDescription,
); //
router.get(
  "/getImageAndDescriptions/params/:id",
  protect,
  getImageAndDescriptions,
); //
router.post("/createJob", protect, createJob); //
router.put("/updateJobAssign", protect, updateJobAssign); //
router.post("/registerJob", protect, registerJob); //
router.delete("/deleteBaanJob/params/:id", protect, deleteBaanJob); //
router.delete("/deletePartJob/params/:id", protect, deletePartJob); //
router.post("/createGroupContainer/", protect, createGroupContainer); //
router.post("/createSubGroup/", protect, createSubGroup); //
router.put("/updateGroupContainer/", protect, updateGroupContainer); //
router.put("/updateSubGroup/", protect, updateSubGroup); //
router.delete(
  "/deleteGroupContainer/params/:id",
  protect,
  deleteGroupContainer,
); //
router.delete("/deleteSubGroup/params/:id", protect, deleteSubGroup); //
router.get("/getGroupContainerForAdmin/params/:id", getGroupContainerForAdmin); //
router.post("/registerGroup/", protect, registerGroup); //
router.post("/createSubGroupByAnyone/", protect, createSubGroupByAnyone); //
router.put("/updateSubGroupByAnyone/", protect, updateSubGroupByAnyone); //
router.get("/getActionPlanForEdit/params/:id", protect, getActionPlanForEdit); //
router.post("/createMirrorUser/", protect, createMirrorUser); //
router.put("/updateMirrorUser/", protect, updateMirrorUser); //
router.delete("/deleteMirrorUser/params/:id", protect, deleteMirrorUser); //
router.post("/createMirrorBaan/", protect, createMirrorBaan); //
router.put("/updateMirrorBaan/", protect, updateMirrorBaan); //
router.delete("/deleteMirrorBaan/params/:id", protect, deleteMirrorBaan); //
router.post("/createItem/", protect, createItem); //
router.post("/createOrder/", protect, createOrder); //
router.put("/updateItem/", protect, updateItem); //
router.delete("/deleteItem/params/:id", protect, deleteItem); //
router.delete("/deleteOrder/params/:id", protect, deleteOrder); //
router.get("/getOrderForAdmin/params/:id", protect, getOrderForAdmin); //
router.put("/completeOrder/params/:id", protect, completeOrder); //
router.get("/getOverrideHealthIssue/params/:id", getOverrideHealthIssue); //
router.put("/updateOverrideHealthIssue/", protect, updateOverrideHealthIssue); //
router.get("/getAuthPartForPage/params/:id", protect, getAuthPartForPage); //
router.post("/addStaffToCamp/", protect, addStaffToCamp); //
router.put("/updateStaffRegister/", protect, updateStaffRegister); //
router.get(
  "/getDataForStaffUpdateRegister/params/:id",
  protect,
  getDataForStaffUpdateRegister,
); //
router.post("/createCampDict/", protect, createCampDict); //
router.put("/updateCampDict/", protect, updateCampDict); //
router.delete("/deleteCampDict/params/:id", protect, deleteCampDict); //
router.get("/getCampDictsForUpdate/params/:id", getCampDictsForUpdate); //
router.get("/getBaanDictsForUpdate/params/:id", getBaanDictsForUpdate); //
router.get("/getPartDictsForUpdate/params/:id", getPartDictsForUpdate); //
export default router;
