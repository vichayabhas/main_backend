import express from "express";
import { modePee, pee, protect } from "../middleware/auth";
import { realTimeScoring } from "../controllers/camp/questionAndAnswer";
import {
  createPartChat,
  getSystemInfo,
  getAllChatFromCampId,
  getPartChat,
  getNongBaanChat,
  getPeeBaanChat,
  getNongChat,
  createNongChat,
  createPeeBaanChat,
  createNongBaanChat,
  getPartPeebaanChat,
} from "../controllers/randomThing/chat";
import {
  getLostAndFounds,
  addLostAndFound,
} from "../controllers/randomThing/lostAndFound";
import {
  createMeal,
  createFood,
  getFoodForUpdate,
  updateFood,
  getMealByUser,
  deleteFood,
  deleteMeal,
  getFoods,
  getMeal,
  updateMeal,
} from "../controllers/randomThing/meal";
import {
  getAllBuilding,
  createBuilding,
  getPlaces,
  getPlace,
  createPlace,
  getBuilding,
  getShowPlace,
} from "../controllers/randomThing/place";
import {
  getMenuSongs,
  createSong,
  getShowSong,
  addCampSong,
  updateSongPage,
  addLikeSong,
  addBaanSong,
  getShowCampSongs,
  getShowBaanSongs,
  getAuthSongs,
} from "../controllers/randomThing/song";

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
router.get("/getShowCampSongs/params/:id", protect, getShowCampSongs); //
router.get("/getShowBaanSongs/params/:id", protect, getShowBaanSongs); //
router.get("/getAuthSongs/params/:id", protect, getAuthSongs); //
router.post("/realTimeScoring/", realTimeScoring); //
export default router;
