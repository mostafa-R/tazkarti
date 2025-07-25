// import express from "express";
// import { confirmBooking, prepareBooking } from "../controllers/booking.controller.js";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { roleMiddleware } from "../middleware/roleMiddleware.js";

// const router = express.Router();

// // router.post(
// //   "/bookings",
// //   authMiddleware,
// //   roleMiddleware(["organizer", "admin","user"]),
// //   createBooking
// // );


// router.post("/prepare", authMiddleware, prepareBooking);
// router.post("/confirm", authMiddleware, confirmBooking);

// // router.get(
// //   "/",
// //   authMiddleware,
// //   roleMiddleware(["organizer", "admin"]),
// //   getBookings
// // );
// // router.get(
// //   "/:id",
// //   authMiddleware,
// //   roleMiddleware(["organizer", "admin"]),
// //   getBookingById
// // );
// // router.put(
// //   "/:id",
// //   authMiddleware,
// //   roleMiddleware(["organizer", "admin"]),
// //   validate(updateBookingSchema),
// //   updateBooking
// // );
// // router.delete(
// //   "/:id",
// //   authMiddleware,
// //   roleMiddleware(["organizer", "admin"]),
// //   deleteBooking
// // );

// export default router;
