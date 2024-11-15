import express from "express";
import { modePee, pee, protect } from "../middleware/auth";
import { addLostAndFound, createBuilding, createNongBaanChat, createNongChat, createPartChat, createPeeBaanChat, createPlace, getAllBuilding, getAllChatFromCampId, getBuilding, getLostAndFounds, getNongBaanChat, getNongChat, getPartChat, getPartPeebaanChat, getPeeBaanChat, getPlace, getPlaces, getShowPlace, getSystemInfo } from "../controllers/randomThing";


const router = express.Router()
router.get('/getAllBuilding/', getAllBuilding)//
router.post('/createBuilding/params/:id', protect, pee, createBuilding)//
router.get('/getPlaces/params/:id', getPlaces)//
router.get('/getPlace/params/:id', getPlace)//
router.post('/createPlace/', protect, pee, createPlace)//
router.get('/getBuilding/params/:id', getBuilding)//
router.get('/getLostAndFounds/', protect, getLostAndFounds)//
router.post('/addLostAndFound/', protect, addLostAndFound)//
router.get('/getShowPlace/params/:id', getShowPlace)//
router.post('/createPartChat/', protect, pee, createPartChat)//
router.get('/getSystemInfo/', getSystemInfo)//
router.get('/getAllChatFromCampId/params/:id', protect, getAllChatFromCampId)//
router.get('/getPartChat/params/:id', protect, getPartChat)//
router.get('/getNongBaanChat/params/:id', protect, getNongBaanChat)//
router.get('/getPeeBaanChat/params/:id', protect, pee, modePee, getPeeBaanChat)//
router.get('/getNongChat/params/:id', protect, getNongChat)//
router.post('/createNongChat/', protect, createNongChat)//
router.post('/createPeeBaanChat/', protect, pee, createPeeBaanChat)//
router.post('/createNongBaanChat/', protect, createNongBaanChat)//
router.get('/getPartPeebaanChat/params/:id', protect, pee, getPartPeebaanChat)//
// export async function editChat
// export async function deleteChat
export default router