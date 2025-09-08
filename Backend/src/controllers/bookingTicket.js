import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import QRCodeService from "../services/qrCodeService.js";
import logger from "../utils/logger.js";

/**
 * الحصول على تفاصيل التذكرة وكود QR
 */
export const getTicketDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // البحث عن الحجز باستخدام المعرف أو رمز الحجز
    const query = mongoose.isValidObjectId(bookingId)
      ? { _id: bookingId }
      : { bookingCode: bookingId };

    const booking = await Booking.findOne(query)
      .populate("event", "title startDate endDate location images description")
      .populate("ticket", "type price currency")
      .populate("user", "userName email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // التحقق من صلاحيات المستخدم (يمكنه رؤية حجوزاته فقط إلا إذا كان مشرفًا أو منظمًا)
    if (
      userRole !== "admin" &&
      userRole !== "organizer" &&
      booking.user._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية للوصول إلى هذا الحجز",
      });
    }

    // البحث عن معلومات الدفعة إن وجدت
    const payment = await Payment.findOne({ booking: booking._id });

    // إذا لم يكن هناك رمز QR أو كان هناك حاجة لإعادة توليده
    if (!booking.qrCode || req.query.regenerate === 'true') {
      try {
        // توليد رمز QR جديد للتذكرة
        const qrData = await QRCodeService.generateTicketQR({
          bookingId: booking._id,
          bookingCode: booking.bookingCode,
          eventId: booking.event._id,
          userId: booking.user._id,
          attendeeName: booking.attendeeInfo.name,
          attendeeEmail: booking.attendeeInfo.email,
          ticketType: booking.ticket.type,
          quantity: booking.quantity,
          eventDate: booking.event.startDate,
          eventTitle: booking.event.title,
          eventLocation: booking.event.location,
        });

        // تحديث الحجز برمز QR الجديد
        booking.qrCode = qrData.qrCodeDataUrl;
        await booking.save();
      } catch (error) {
        logger.error("Error generating QR code:", error);
      }
    }

    // إعداد بيانات الاستجابة
    const data = {
      _id: booking._id,
      bookingId: booking._id,
      bookingCode: booking.bookingCode,
      status: booking.status,
      bookingStatus: booking.status,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      quantity: booking.quantity,
      createdAt: booking.createdAt,
      qrCode: booking.qrCode,
      event: booking.event,
      ticket: booking.ticket,
      attendeeInfo: booking.attendeeInfo,
      payment: payment
        ? {
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            transactionId: payment.transactionId,
            paidAt: payment.capturedAt,
            amount: payment.amount,
            currency: payment.currency,
          }
        : null,
    };

    return res.status(200).json({
      success: true,
      message: "تم جلب تفاصيل التذكرة بنجاح",
      data
    });
  } catch (error) {
    logger.error("Get ticket details error:", error);
    return res.status(500).json({
      success: false,
      message: "فشل في جلب تفاصيل التذكرة",
      error: error.message,
    });
  }
};

/**
 * تنزيل التذكرة كملف PDF
 */
export const downloadTicket = async (req, res) => {
  try {

    const { bookingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // البحث عن الحجز باستخدام المعرف أو رمز الحجز
    const query = mongoose.isValidObjectId(bookingId)
      ? { _id: bookingId }
      : { bookingCode: bookingId };

    const booking = await Booking.findOne(query)
      .populate("event", "title startDate endDate location images description")
      .populate("ticket", "type price currency features")
      .populate("user", "userName email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "الحجز غير موجود",
      });
    }

    // التحقق من صلاحيات المستخدم
    if (
      userRole !== "admin" &&
      userRole !== "organizer" &&
      booking.user._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "ليس لديك صلاحية للوصول إلى هذا الحجز",
      });
    }

    // التحقق من أن الحجز مؤكد أو أن المستخدم مشرف/منظم
    if (
      userRole !== "admin" &&
      userRole !== "organizer" &&
      (booking.status !== "confirmed" || booking.paymentStatus !== "completed")
    ) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن تنزيل التذكرة لأن الحجز غير مؤكد أو الدفع غير مكتمل",
      });
    }

    // إنشاء ملف PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Ticket - ${booking.bookingCode}`,
        Author: 'Tazkarti System',
      }
    });

    // إعداد الاستجابة
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${booking.bookingCode}.pdf"`);

    // توجيه الـ PDF إلى الاستجابة
    doc.pipe(res);

    // تصميم التذكرة
    // الشعار والعنوان
    doc.fontSize(25)
      .text('Tazkarti', { align: 'center' })
      .fontSize(18)
      .text('E-Ticket', { align: 'center' })
      .moveDown(0.5);

    // خط فاصل
    doc.moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown(1);

    // معلومات الحدث
    doc.fontSize(16)
      .fillColor('#333333')
      .text('Event Details', { underline: true })
      .moveDown(0.5);

    doc.fontSize(14)
      .fillColor('#000000')
      .text(`Event: ${booking.event.title}`)
      .moveDown(0.3);

    // تاريخ ووقت الحدث
    const eventDate = new Date(booking.event.startDate);
    doc.fontSize(12)
      .fillColor('#555555')
      .text(`Date: ${eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`)
      .moveDown(0.2);

    // الموقع
    let locationText = '';
    if (booking.event.location) {
      if (typeof booking.event.location === 'object') {
        const { venue, city, country } = booking.event.location;
        locationText = [venue, city, country].filter(Boolean).join(', ');
      } else {
        locationText = booking.event.location;
      }
    }

    doc.text(`Location: ${locationText || 'Not specified'}`)
      .moveDown(1);

    // معلومات التذكرة
    doc.fontSize(16)
      .fillColor('#333333')
      .text('Ticket Information', { underline: true })
      .moveDown(0.5);

    doc.fontSize(12)
      .fillColor('#555555')
      .text(`Ticket Type: ${booking.ticket.type}`)
      .text(`Quantity: ${booking.quantity}`)
      .text(`Price: ${booking.totalPrice} ${booking.ticket.currency}`)
      .text(`Booking Code: ${booking.bookingCode}`)
      .moveDown(1);

    // معلومات الحاضر
    doc.fontSize(16)
      .fillColor('#333333')
      .text('Attendee Information', { underline: true })
      .moveDown(0.5);

    doc.fontSize(12)
      .fillColor('#555555')
      .text(`Name: ${booking.attendeeInfo?.name || booking.user.userName}`)
      .text(`Email: ${booking.attendeeInfo?.email || booking.user.email}`)
      .text(`Phone: ${booking.attendeeInfo?.phone || booking.user.phone || 'Not provided'}`)
      .moveDown(1);

    // حالة الحجز
    doc.fontSize(16)
      .fillColor('#333333')
      .text('Booking Status', { underline: true })
      .moveDown(0.5);

    const statusColor = booking.status === 'confirmed' ? '#008000' : '#FF0000';
    doc.fontSize(14)
      .fillColor(statusColor)
      .text(`Status: ${booking.status.toUpperCase()}`)
      .text(`Payment Status: ${booking.paymentStatus.toUpperCase()}`)
      .moveDown(1);

    // إضافة رمز QR إذا كان موجودًا
    if (booking.qrCode) {
      doc.fontSize(16)
        .fillColor('#333333')
        .text('QR Code', { align: 'center' })
        .moveDown(0.5);

      // تحويل رمز QR من صيغة base64 إلى صورة
      try {
        // استخراج البيانات من رمز QR (تخطي الجزء 'data:image/png;base64,')
        const qrData = booking.qrCode.split(',')[1];
        const qrBuffer = Buffer.from(qrData, 'base64');

        // حساب موقع وسط الصفحة
        const centerX = (doc.page.width - 150) / 2;

        // إضافة الصورة
        doc.image(qrBuffer, centerX, doc.y, { width: 150 });
        doc.moveDown(7); // مسافة كافية بعد الصورة
      } catch (error) {
        logger.error('Error adding QR code to PDF:', error);
        doc.text('QR Code not available', { align: 'center' });
        doc.moveDown(1);
      }
    }

    // معلومات إضافية
    doc.fontSize(10)
      .fillColor('#888888')
      .text('This ticket is valid only with a valid ID. Please arrive 30 minutes before the event.', { align: 'center' })
      .moveDown(0.5);

    // التذييل
    doc.fontSize(8)
      .fillColor('#AAAAAA')
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      .text('Tazkarti - All Rights Reserved', { align: 'center' });

    // إنهاء المستند
    doc.end();

  } catch (error) {
    logger.error("Download ticket error:", error);
    return res.status(500).json({
      success: false,
      message: "فشل في تنزيل التذكرة",
      error: error.message,
    });
  }
};
