import express from "express";
import {
  bookingGewertzSquareRoom,
  deleteBookingGewertzSquareRoom,
  getGewertzSquareBooking,
  updateBookingGewertzSquareRoom,
  gewertzSquareRegister,
  gewertzSquareLogin,
  getGewertzSquareUserMe,
  updateGewertzSquareAccount,
  approveBookingGewertzSquareRoom,
} from "../controllers/gewertzSquare";

const router = express.Router();
router.post("/bookingGewertzSquareRoom/", bookingGewertzSquareRoom);
router.get("/getGewertzSquareBooking/", getGewertzSquareBooking);
router.put("/updateBookingGewertzSquareRoom/", updateBookingGewertzSquareRoom);
router.delete(
  "/deleteBookingGewertzSquareRoom/params/:id",
  deleteBookingGewertzSquareRoom
);
router.post("/gewertzSquareRegister/", gewertzSquareRegister);
router.post("/gewertzSquareLogin/", gewertzSquareLogin);
router.get("/getGewertzSquareUserMe/", getGewertzSquareUserMe);
router.post("/updateGewertzSquareAccount/", updateGewertzSquareAccount);
router.post(
  "/approveBookingGewertzSquareRoom/params/:id",
  approveBookingGewertzSquareRoom
);

export default router;
