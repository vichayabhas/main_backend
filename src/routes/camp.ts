import express from 'express';

const router = express.Router();

import { protect, pee } from '../middleware/auth';
import { getCamps, getCampName, getCamp, getNongCamp, getPeeCamp, getBaan, getPart, getPartName, nongRegister, staffRegister, getNongsFromBaanId, getPeesFromBaanId, getPeesFromPartId, getPetosFromPartId, getBaans, getActionPlans, getActionPlanByPartId, createActionPlan, getActionPlan, updateActionPlan, deleteActionPlan, createWorkingItem, getWorkingItems, getWorkingItemByPartId, getWorkingItem, updateWorkingItem, deleteWorkingItem, getPetoCamp, getShowRegisters, addNong, addPee, changeBaan, changePart, getAllUserCamp, getAllWelfare, getAllPlanData, planUpdateCamp, editQuestion, deleteChoiceQuestion, deleteTextQuestion, getAllQuestion, plusActionPlan } from '../controllers/camp';
import { interview, kickNong, kickPee, paid, pass, sure } from '../controllers/admidsion';
router.get('/getCamps/', getCamps)//
router.get('/getCampName/params/:id', getCampName)//
router.get('/getCamp/params/:id', getCamp)//
router.get('/nongCamp/params/:id', getNongCamp)//
router.get('/peeCamp/params/:id', getPeeCamp)//
router.get('/PetoCamp/params/:id', getPetoCamp)//
router.get('/baan/params/:id', getBaan)//
router.get('/part/params/:id', getPart)//
router.get('/partName/params/:id', getPartName)//
router.post('/nongRegisterCamp/', protect, nongRegister)//
router.post('/staffRegisterCamp/params/:id', protect, pee, staffRegister)//
router.get('/getNongsFromBaanId/params/:id', getNongsFromBaanId)//
router.get('/getPeesFromBaanId/params/:id', getPeesFromBaanId)//
router.get('/getPeesFromPartId/params/:id', getPeesFromPartId)//
router.get('/getPetosFromPartId/params/:id', getPetosFromPartId)//
router.get('/getBaans/params/:id', getBaans)//
router.get('/getActionPlans/', protect, pee, getActionPlans)//
router.get('/getActionPlanByPartId/params/:id', protect, pee, getActionPlanByPartId)//
router.post('/createActionPlan/', protect, pee, createActionPlan)//
router.get('/getActionPlan/params/:id', protect, pee, getActionPlan)//
router.put('/updateActionPlan/params/:id', protect, pee, updateActionPlan)//
router.delete('/deleteActionPlan/params/:id', protect, pee, deleteActionPlan)//
router.post('/createWorkingItem/', protect, pee, createWorkingItem)//
router.get('/getWorkingItems/', protect, pee, getWorkingItems)//
router.get('/getWorkingItemByPartId/params/:id', protect, pee, getWorkingItemByPartId)//
router.get('/getWorkingItem/params/:id', protect, pee, getWorkingItem)//
router.put('/updateWorkingItem/params/:id', protect, pee, updateWorkingItem)//
router.delete('/deleteWorkingItem/params/:id', protect, pee, deleteWorkingItem)//
router.get('/getShowRegisters/params/:id', protect, pee, getShowRegisters)//
router.post('/interview/', protect, pee, interview)//
router.post('/pass/', protect, pee, pass)//
router.post('/sure/', protect, pee, sure)//
router.post('/paid/params/:id', protect, paid)//
router.post('/add/nong/', protect, pee, addNong)//
router.post('/add/pee/', protect, pee, addPee)//
router.post('/kick/pee/', protect, pee, kickPee)//
router.post('/kick/nong/', protect, pee, kickNong)//
router.post('/changeBaan/', protect, pee, changeBaan)//
router.post('/changePart/', protect, pee, changePart)//
router.get('/getAllUserCamp/', protect, getAllUserCamp)//
router.get('/getAllWelfare/params/:id', getAllWelfare)//
router.get('/getAllPlanData/params/:id', getAllPlanData)//
router.put('/planUpdateCamp/', protect, planUpdateCamp)//
router.put('/editQuestion/', protect, editQuestion)//
router.get('/getAllQuestion/params/:id', protect, getAllQuestion)//
router.delete('/deleteChoiceQuestion/params/:id', protect, deleteChoiceQuestion)//
router.delete('/deleteTextQuestion/params/:id', protect, deleteTextQuestion)//
router.post('/plusActionPlan/',protect,plusActionPlan)
export default router;
// export async function deleteChoiceQuestion
// export async function deleteTextQuestion


//'getNongsFromBaanId' | 'getPeesFromBaanId' | 'getPeesFromPartId' | 'getPetosFromPartId'

