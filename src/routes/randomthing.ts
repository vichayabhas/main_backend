import express from "express";
import { modePee, pee, protect } from "../middleware/auth";
import {
  addBaanSong,
  addCampSong,
  addLikeSong,
  addLostAndFound,
  createBuilding,
  createFood,
  createMeal,
  createNongBaanChat,
  createNongChat,
  createPartChat,
  createPeeBaanChat,
  createPlace,
  createSong,
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
  getMenuSongs,
  getNongBaanChat,
  getNongChat,
  getPartChat,
  getPartPeebaanChat,
  getPeeBaanChat,
  getPlace,
  getPlaces,
  getShowPlace,
  getShowSong,
  getSystemInfo,
  updateFood,
  updateMeal,
  updateSongPage,
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
router.get("/getMenuSongs/", getMenuSongs); //
router.post("/createSong/", protect, createSong); //
router.get("/getShowSong/params/:id", getShowSong); //
router.post("/addCampSong/params/:id", protect, addCampSong); //
router.post("/updateSongPage/", protect, updateSongPage); //
router.post("/addLikeSong/", protect, addLikeSong); //
router.post("/addBaanSong/params/:id", protect, addBaanSong); //
export default router;
