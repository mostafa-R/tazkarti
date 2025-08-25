// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";
// import { Booking } from "../models/Booking.js";
// import { Event } from "../models/Event.js";
// import { Ticket } from "../models/Ticket.js";
// import User from "../models/User.js";

// export const bookingTicket = async (req, res) => {
//   const { ticketId, eventId, type, quantity } = req.body;

//   const userId = req.user._id;

//   const attendeeInfo = {
//     name: req.user.userName,
//     email: req.user.email,
//     phone: req.user.phone,
//   };

//   const bookingCode = uuidv4();

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const event = await Event.findById(eventId).session(session);
//     if (!event) {
//       throw new Error("Event not found");
//     }

//     if (new Date(event.endDate) < new Date()) {
//       throw new Error("Event is ended");
//     }

//     const ticket = await Ticket.findOne({
//       _id: ticketId,
//       event: eventId,
//       type,
//       status: "active",
//       isActive: true,
//     }).session(session);

//     if (!ticket || ticket.availableQuantity < quantity) {
//       throw new Error("Tickets not available");
//     }

//     const totalPrice = ticket.price * quantity;

//     const [booking] = await Booking.create(
//       [
//         {
//           user: userId,
//           event: eventId,
//           ticket: ticket._id,
//           quantity,
//           totalPrice,
//           status: "pending",
//           paymentStatus: "pending",
//           attendeeInfo: attendeeInfo,
//           bookingCode,
//         },
//       ],
//       { session }
//     );

//     ticket.availableQuantity -= quantity;
//     await ticket.save({ session });

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $push: { ticketsBooked: booking._id } },
//       { session, new: true }
//     );

//     if (!updatedUser) {
//       throw new Error("User update failed");
//     }

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(201).json({
//       message: "Booking confirmed",
//       bookingId: booking._id,
//       totalPrice,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Booking error:", error);
//     return res.status(500).json({
//       message: "Booking failed",
//       error: error.message,
//     });
//   }
// };

//==================================================================

import express from "express";
import axios from "axios";
import crypto from "crypto";
import { Event } from "../models/Event.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
// import {PayMobService} from "./checkout.controller.js";
import { Ticket } from "../models/Ticket.js";
import Booking from "../models/Booking.js";


// export const bookingTicketWithPayment = async (req, res) => {
//   const { ticketId, eventId, type, quantity } = req.body;
//   const userId = req.user._id;

//   const attendeeInfo = {
//     name: req.user.userName,
//     email: req.user.email,
//     phone: req.user.phone,
//   };

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // التحقق من الحدث والتذكرة (نفس الكود السابق)
//     const event = await Event.findById(eventId).session(session);
//     if (!event) {
//       throw new Error("Event not found");
//     }

//     if (new Date(event.endDate) < new Date()) {
//       throw new Error("Event is ended");
//     }

//     const ticket = await Ticket.findOne({
//       _id: ticketId,
//       event: eventId,
//       type,
//       // status: "active",
//       // isActive: true,
//     }).session(session);

//     console.log(ticket);
//     if (!ticket || ticket.availableQuantity < quantity) {
//       throw new Error("Tickets not available");
//     }

//     const totalPrice = ticket.price * quantity;
//     const bookingCode = uuidv4();

//     // إنشاء الحجز بحالة pending
//     const [booking] = await Booking.create(
//       [
//         {
//           user: userId,
//           event: eventId,
//           ticket: ticket._id,
//           quantity,
//           totalPrice,
//           status: "pending",
//           paymentStatus: "pending",
//           attendeeInfo: attendeeInfo,
//           bookingCode,
//         },
//       ],
//       { session }
//     );

//     // تحديث كمية التذاكر المتاحة (مؤقتاً)
//     ticket.availableQuantity -= quantity;
//     await ticket.save({ session });

//     // تحديث المستخدم
//     await User.findByIdAndUpdate(
//       userId,
//       { $push: { ticketsBooked: booking._id } },
//       { session, new: true }
//     );

//     await session.commitTransaction();
//     session.endSession();

//     // إنشاء عملية الدفع مع PayMob
//     // const payMobService = new PayMobService();

//     try {
//       // 1. المصادقة
//       const authToken = await payMobService.authenticate();

//       // 2. إنشاء الطلب
//       const orderData = {
//         amount_cents: totalPrice * 100, // تحويل إلى قروش
//         items: [
//           {
//             name: `${event.name} - ${ticket.type}`,
//             amount_cents: ticket.price * 100,
//             description: `Ticket for ${event.name}`,
//             quantity: quantity,
//           },
//         ],
//       };

//       const order = await payMobService.createOrder(authToken, orderData);

//       // 3. الحصول على مفتاح الدفع
//       const billingData = {
//         apartment: "NA",
//         email: req.user.email,
//         floor: "NA",
//         first_name: req.user.userName.split(" ")[0] || req.user.userName,
//         street: "NA",
//         building: "NA",
//         phone_number: req.user.phone || "NA",
//         shipping_method: "NA",
//         postal_code: "NA",
//         city: "NA",
//         country: "EG",
//         last_name: req.user.userName.split(" ")[1] || req.user.userName,
//         state: "NA",
//       };

//       const paymentKey = await payMobService.getPaymentKey(
//         authToken,
//         order.id,
//         billingData,
//         totalPrice * 100
//       );

//       // حفظ معرف الطلب في PayMob مع الحجز
//       await Booking.findByIdAndUpdate(booking._id, {
//         paymentOrderId: order.id,
//         paymentKey: paymentKey,
//       });

//       // إرجاع رابط الدفع
//       const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${payMobService.iframeId}?payment_token=${paymentKey}`;

//       return res.status(201).json({
//         message: "تم إنشاء الحجز بنجاح، يرجى إكمال الدفع",
//         bookingId: booking._id,
//         totalPrice,
//         paymentUrl,
//         paymentKey,
//       });
//     } catch (paymentError) {
//       // في حالة فشل إنشاء الدفع، إلغاء الحجز
//       await Booking.findByIdAndUpdate(booking._id, {
//         status: "cancelled",
//         paymentStatus: "failed",
//       });

//       // إعادة كمية التذاكر
//       await Ticket.findByIdAndUpdate(ticketId, {
//         $inc: { availableQuantity: quantity },
//       });

//       throw new Error("فشل في إنشاء عملية الدفع: " + paymentError.message);
//     }
//   } catch (error) {
//     if (session.inTransaction()) {
//       await session.abortTransaction();
//     }
//     session.endSession();

//     console.error("Booking error:", error);
//     return res.status(500).json({
//       message: "فشل في الحجز",
//       error: error.message,
//     });
//   }
// };




