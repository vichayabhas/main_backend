import express from "express";
import { addBaan, addCampName, addPart, addPartName, afterVisnuToPee, createBaanByGroup, createCamp, getAllRemainPartName, getCampNames, getPartNames, peeToPeto, saveDeleteCamp, updateBaan, updateCamp, updatePart } from "../controllers/admin";
import { admin, pee, protect } from "../middleware/auth";

const router = express.Router()
router.get('/getCampNames/', getCampNames)//
router.post('/createCamp/', protect, admin, createCamp)//
router.post('/addCampName/params/:id', protect, admin, addCampName)//
router.get('/getPartNames/', getPartNames)//
router.post('/addPartName/params/:id', addPartName)//
router.put('/updateCamp/params/:id', protect, updateCamp)//
router.post('/addBaan/', protect, addBaan)//
router.put('/updatePart/', protect, updatePart)//
router.get('/getAllRemainPartName/params/:id', protect, pee, getAllRemainPartName)//
router.post('/addPart/', protect, addPart)//
router.post('/createBaanByGroup/params/:id', protect, createBaanByGroup)//
router.put('/updateBaan/', protect, updateBaan)//
router.delete('/saveDeleteCamp/params/:id', protect, saveDeleteCamp)//
router.post('/afterVisnuToPee/', protect, admin, afterVisnuToPee)//
router.post('/peeToPeto/', protect, admin, peeToPeto)//
export default router