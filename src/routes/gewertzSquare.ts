import express from "express";
import {
  bookingGewertzSquareRoom,
  deleteBookingGewertzSquareRoom,
  getGewertzSquareBooking,
  updateBookingGewertzSquareRoom,
} from "../controllers/GewertzSquare";
const router = express.Router();
router.post("/bookingGewertzSquareRoom/", bookingGewertzSquareRoom);
router.get("/getGewertzSquareBooking/", getGewertzSquareBooking);
router.put("/updateBookingGewertzSquareRoom/", updateBookingGewertzSquareRoom);
router.delete('/deleteBookingGewertzSquareRoom/params/:id',deleteBookingGewertzSquareRoom)

export default router;
