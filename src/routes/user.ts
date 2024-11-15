import express from 'express';
import { register, login, getMe, updateSize, updateMode, getCampMemberCardByCampId, updateProfile, updateBottle, changeModeToPee, updateSleep, getHeathIssue, checkTel, getUsers, getCampMemberCard, updateTimeOffset, getTimeOffset, updateHeath, signId, verifyEmail, checkPassword, bypassRole, } from '../controllers/user';

const router = express.Router();

import { protect, pee } from '../middleware/auth';

router.post('/register', register);//
router.post('/login', login);//
router.get('/me', protect, getMe)//
router.put('/updateSize/params/:id', protect, updateSize)//
router.put('/updateMode/', protect, pee, updateMode)//
router.get('/getCampMemberCardByCampId/params/:id', getCampMemberCardByCampId)//
router.put('/updateProfile/', protect, updateProfile)//
router.put('/updateBottle/', protect, updateBottle)//
router.post('/changeModeToPee/', protect, pee, changeModeToPee)//
router.put('/updateSleep/', protect, updateSleep)//
router.get('/getHeathIssue/params/:id', getHeathIssue)//
router.get('/checkTel/params/:id', protect, checkTel)//
router.get('/getUser/params/:id', getUsers)//
router.get('/getCampMemberCard/params/:id', getCampMemberCard)//
router.put('/updateTimeOffset/', protect, updateTimeOffset)//
router.get('/getTimeOffset/params/:id', getTimeOffset)//
router.put('/updateHeath/', protect, updateHeath)//
router.post('/signId/', protect, signId)//
router.post('/verifyEmail/', protect, verifyEmail)//
router.post('/checkPassword/', protect, checkPassword)//
router.post('/bypassRole/', protect, bypassRole)//
export default router;