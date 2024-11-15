import express from "express";
import { protect } from "../middleware/auth";
import { adminBypass, nongBypass, peeBypass, petoBypass } from "../controllers/subFrontend";



const router = express.Router()
router.post('/adminBypass/', protect, adminBypass)
router.post('/peeBypass/', protect, peeBypass)
router.post('/nongBypass/', protect, nongBypass)
router.post('/petoBypass/', protect, petoBypass)
export default router