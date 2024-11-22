import express from "express";
import { modePee, pee, protect } from "../middleware/auth";
import {
  addLostAndFound,
  createBuilding,
  createFood,
  createMeal,
  createNongBaanChat,
  createNongChat,
  createPartChat,
  createPeeBaanChat,
  createPlace,
  deleteFood,
  deleteMeal,
  getAllBuilding,
  getAllChatFromCampId,
  getBuilding,
  getFoodForUpdate,
  getFoods,
  getLostAndFounds,
  getMeal,
  getMealByUser,
  getMealsByUser,
  getNongBaanChat,
  getNongChat,
  getPartChat,
  getPartPeebaanChat,
  getPeeBaanChat,
  getPlace,
  getPlaces,
  getShowPlace,
  getSystemInfo,
  updateFood,
  updateMeal,
} from "../controllers/randomThing";

const router = express.Router();
router.get("/getAllBuilding/", getAllBuilding); //
router.post("/createBuilding/params/:id", protect, pee, createBuilding); //
router.get("/getPlaces/params/:id", getPlaces); //
router.get("/getPlace/params/:id", getPlace); //
router.post("/createPlace/", protect, pee, createPlace); //
router.get("/getBuilding/params/:id", getBuilding); //
router.get("/getLostAndFounds/", protect, getLostAndFounds); //
router.post("/addLostAndFound/", protect, addLostAndFound); //
router.get("/getShowPlace/params/:id", getShowPlace); //
router.post("/createPartChat/", protect, pee, createPartChat); //
router.get("/getSystemInfo/", getSystemInfo); //
router.get("/getAllChatFromCampId/params/:id", protect, getAllChatFromCampId); //
router.get("/getPartChat/params/:id", protect, getPartChat); //
router.get("/getNongBaanChat/params/:id", protect, getNongBaanChat); //
router.get("/getPeeBaanChat/params/:id", protect, pee, modePee, getPeeBaanChat); //
router.get("/getNongChat/params/:id", protect, getNongChat); //
router.post("/createNongChat/", protect, createNongChat); //
router.post("/createPeeBaanChat/", protect, pee, createPeeBaanChat); //
router.post("/createNongBaanChat/", protect, createNongBaanChat); //
router.get("/getPartPeebaanChat/params/:id", protect, pee, getPartPeebaanChat); //
router.post("/createMeal/", protect, createMeal); //
router.post("/createFood/", protect, createFood); //
router.get("/getFoodForUpdate/params/:id", getFoodForUpdate); //
router.put("/updateFood/", protect, updateFood); //
router.get("/getMealByUser/params/:id", protect, getMealByUser); //
router.delete("/deleteFood/params/:id", protect, deleteFood); //
router.delete("/deleteMeal/params/:id", protect, deleteMeal); //
router.get("/getFoods/params/:id", getFoods); //
router.get("/getMeal/params/:id", getMeal); //
router.put("/updateMeal/", protect, updateMeal); //
router.get("/getMealsByUser/params/:id", protect, getMealsByUser); //
export default router;
