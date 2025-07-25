// export const prepareBooking = async (req, res) => {
//   const { eventId, type, quantity } = req.body;

//   try {
//     const event = await Event.findById(eventId);
//     if (!event || event.status !== "active" || event.isSoldOut) {
//       return res.status(400).json({ message: "Event not bookable" });
//     }

//     if (event.availableSpots < quantity) {
//       return res.status(400).json({ message: "Not enough spots" });
//     }

//     const ticket = await Ticket.findOne({
//       event: eventId,
//       type,
//       status: "active",
//       isActive: true,
//     });

//     if (!ticket || ticket.availableQuantity < quantity) {
//       return res.status(400).json({ message: "Tickets not available" });
//     }

//     const totalPrice = ticket.price * quantity;

//     // أرجع فقط تفاصيل الدفع للمستخدم
//     res.status(200).json({
//       message: "Booking is valid, proceed to payment",
//       eventId,
//       ticketType: type,
//       quantity,
//       totalPrice,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Validation failed", error });
//   }
// };

// export const confirmBooking = async (req, res) => {
//   const { eventId, type, quantity, paymentReference } = req.body;
//   const userId = req.user.id;

//   // 👇 هنا لازم تتأكد من الدفع من خلال Paymob/Stripe/etc
//   const isPaymentValid = await verifyPayment(paymentReference);
//   if (!isPaymentValid) {
//     return res.status(400).json({ message: "Payment verification failed" });
//   }

//   // ⬇️ نفس الكود بتاعك مع حفظ Booking
//   try {
//     const event = await Event.findById(eventId);
//     if (!event || event.status !== "active" || event.isSoldOut) {
//       return res.status(400).json({ message: "Event not bookable" });
//     }
//     if (event.availableSpots < quantity) {
//       return res.status(400).json({ message: "Not enough spots" });
//     }
//     const ticket = await Ticket.findOne({
//       event: eventId,
//       type,
//       status: "active",
//       isActive: true,
//     });
//     if (!ticket || ticket.availableQuantity < quantity) {
//       return res.status(400).json({ message: "Tickets not available" });
//     }
//     const totalPrice = ticket.price * quantity;
//     const booking = await Booking.create({
//       event: eventId,
//       user: userId,
//       ticketType: type,
//       quantity,
//       totalPrice,
//       paymentReference,
//       status: "pending",
//       paymentStatus: "pending",
//     });
//     // تحديث الكمية المتاحة في التذكرة
//     ticket.availableQuantity -= quantity;
//     await ticket.save();
//     res.status(201).json({
//       message: "Booking confirmed",
//       bookingId: booking._id,
//       totalPrice,
//     });
//   } catch (error) {
//     console.error("Booking preparation error:", error);
//     res
//       .status(500)
//       .json({ message: "Validation failed", error: error.message });  }
// };

// // const handlePaymentSuccess = async (bookingId) => {
// //   const booking = await Booking.findById(bookingId).populate("event");

// //   if (!booking || booking.paymentStatus === "completed") return;

// //   booking.status = "confirmed";
// //   booking.paymentStatus = "completed";

// //   const tickets = [];

// //   for (let i = 0; i < booking.quantity; i++) {
// //     const qrCode = generateQR({
// //       bookingId,
// //       userId: booking.user._id,
// //       index: i,
// //     });

// //     const ticket = await Ticket.create({
// //       booking: booking._id,
// //       event: booking.event._id,
// //       user: booking.user._id,
// //       qrCode,
// //     });

// //     tickets.push(ticket._id);
// //   }

// //   booking.ticket = tickets[0]; // لو حقل واحد في الـ Booking
// //   await booking.save();
// // };
