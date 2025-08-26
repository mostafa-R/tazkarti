export const generateVerificationEmail = (verificationCode) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Welcome to Our App 👋</h2>
      <p style="color: #555; font-size: 16px;">Thank you for registering. Please use the following verification code to verify your email:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; background-color: #007bff; color: white; padding: 12px 20px; font-size: 20px; border-radius: 6px; letter-spacing: 3px;">
          ${verificationCode}
        </span>
      </div>
      <p style="color: #888; font-size: 14px;">This code will expire in 10 minutes.</p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 13px; color: #aaa;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  </div>`;
};

export const sendAcceptEmail = (eventTitle) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #28a745;">Event Approved ✅</h2>
      <p style="color: #555; font-size: 16px;">
        Congratulations! Your event has been successfully reviewed and approved.
      </p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; background-color: #28a745; color: white; padding: 12px 20px; font-size: 20px; border-radius: 6px; letter-spacing: 1px;">
          ${eventTitle}
        </span>
      </div>
      <p style="color: #555; font-size: 16px;">
        You can now view your event live on the platform. Thank you for contributing to our community.
      </p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 13px; color: #aaa;">
        If you have any questions, feel free to contact our support team.
      </p>
    </div>
  </div>`;
};

export const sendRejectEmail = (eventTitle) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #d9534f;">Event Rejected ❌</h2>
      <p style="color: #555; font-size: 16px;">
        We regret to inform you that your submitted event titled:
      </p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 20px; font-size: 20px; border-radius: 6px; letter-spacing: 1px;">
          ${eventTitle}
        </span>
      </div>
      <p style="color: #555; font-size: 16px;">
        was not approved after review. If you believe this was a mistake or would like more information, feel free to contact our support team.
      </p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 13px; color: #aaa;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>`;
};

// ==================================================
// قوالب إيميل الحجوزات والتذاكر
// ==================================================

/**
 * قالب تأكيد الحجز مع QR Code
 */
export const generateBookingConfirmationEmail = (booking, qrCodeDataUrl) => {
  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد حجز التذكرة - تذكرتي</title>
    <style>
      body { 
        font-family: 'Segoe UI', 'Cairo', Tahoma, Geneva, Verdana, sans-serif; 
        margin: 0; 
        padding: 20px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white; 
        border-radius: 15px; 
        overflow: hidden; 
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }
      .header { 
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
        color: white; 
        padding: 40px 20px; 
        text-align: center; 
        position: relative;
      }
      .header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" fill="%23ffffff10"><polygon points="0,0 1000,0 1000,80 0,100"/></svg>') no-repeat bottom;
        background-size: cover;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        position: relative;
        z-index: 1;
      }
      .header .subtitle {
        margin: 10px 0 0;
        font-size: 16px;
        opacity: 0.9;
        position: relative;
        z-index: 1;
      }
      .content { 
        padding: 40px 30px; 
      }
      .ticket-info { 
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
        padding: 30px; 
        border-radius: 12px; 
        margin: 25px 0; 
        border-right: 5px solid #28a745;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #e0e0e0;
      }
      .info-row:last-child {
        border-bottom: none;
      }
      .info-label {
        font-weight: bold;
        color: #495057;
        flex: 1;
      }
      .info-value {
        flex: 2;
        text-align: left;
        color: #212529;
      }
      .qr-section { 
        text-align: center; 
        margin: 30px 0; 
        padding: 30px;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
      }
      .qr-code {
        margin: 20px 0;
        padding: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        display: inline-block;
      }
      .instructions {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        padding: 25px;
        border-radius: 10px;
        margin: 25px 0;
        border-right: 4px solid #2196f3;
      }
      .instructions h3 {
        color: #1565c0;
        margin-top: 0;
        font-size: 18px;
      }
      .instructions ul {
        margin: 15px 0;
        padding-right: 20px;
      }
      .instructions li {
        margin: 8px 0;
        color: #424242;
      }
      .footer { 
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); 
        color: white; 
        padding: 30px 20px; 
        text-align: center; 
      }
      .social-links {
        margin: 15px 0;
      }
      .social-links a {
        color: white;
        text-decoration: none;
        margin: 0 10px;
        font-size: 14px;
      }
      .booking-code {
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 2px;
        box-shadow: 0 4px 15px rgba(255,107,53,0.3);
      }
      @media (max-width: 600px) {
        .container { margin: 10px; }
        .content { padding: 20px; }
        .ticket-info { padding: 20px; }
        .info-row { flex-direction: column; align-items: flex-start; }
        .info-value { text-align: right; margin-top: 5px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎫 تم تأكيد حجزك بنجاح!</h1>
        <div class="subtitle">مرحباً ${booking.attendeeInfo.name}</div>
      </div>
      
      <div class="content">
        <div style="text-align: center; margin: 20px 0;">
          <div class="booking-code">${booking.bookingCode}</div>
          <p style="margin: 10px 0; color: #666; font-size: 14px;">رقم الحجز</p>
        </div>

        <div class="ticket-info">
          <h2 style="color: #28a745; margin-top: 0; text-align: center; font-size: 22px;">
            📋 تفاصيل التذكرة
          </h2>
          
          <div class="info-row">
            <span class="info-label">🎭 اسم الحدث:</span>
            <span class="info-value"><strong>${
              booking.event.title
            }</strong></span>
          </div>
          
          <div class="info-row">
            <span class="info-label">📅 التاريخ:</span>
            <span class="info-value">${new Date(
              booking.event.startDate
            ).toLocaleDateString("ar-EG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">📍 المكان:</span>
            <span class="info-value">${
              booking.event.location?.address || booking.event.location
            }</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">🎟️ نوع التذكرة:</span>
            <span class="info-value">${booking.ticket.type}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">🔢 عدد التذاكر:</span>
            <span class="info-value">${booking.quantity}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">💰 المبلغ المدفوع:</span>
            <span class="info-value"><strong>${booking.totalPrice} ${
    booking.ticket.currency
  }</strong></span>
          </div>
        </div>

        ${
          qrCodeDataUrl
            ? `
        <div class="qr-section">
          <h3 style="color: #495057; margin-top: 0;">🔗 رمز دخول الحدث</h3>
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 200px; height: auto;">
          </div>
          <p style="color: #666; font-size: 14px; margin: 10px 0;">
            <strong>احتفظ بهذا الرمز لدخول الحدث</strong>
          </p>
        </div>
        `
            : ""
        }

        <div class="instructions">
          <h3>📝 تعليمات مهمة:</h3>
          <ul>
            <li>يرجى إحضار هذا الإيميل أو رمز QR المرفق معك عند حضور الحدث</li>
            <li>يُنصح بالوصول قبل بداية الحدث بـ 30 دقيقة على الأقل</li>
            <li>تأكد من أن بطارية هاتفك مشحونة لعرض QR Code</li>
            <li>احتفظ برقم الحجز للمراجعة: <strong>${
              booking.bookingCode
            }</strong></li>
            <li>في حالة وجود أي استفسارات، يرجى التواصل معنا</li>
          </ul>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; text-align: center;">
            <strong>⚠️ ملاحظة:</strong> هذه التذكرة غير قابلة للاسترداد أو التحويل
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p style="margin: 10px 0; font-size: 18px; font-weight: bold;">
          شكراً لاستخدامكم منصة تذكرتي 🎉
        </p>
        <div class="social-links">
          <a href="#" style="margin: 0 15px;">📧 support@tazkarti.com</a>
          <a href="#" style="margin: 0 15px;">📱 اتصل بنا</a>
        </div>
        <p style="margin: 15px 0 5px; font-size: 14px; opacity: 0.8;">
          © ${new Date().getFullYear()} Tazkarti. جميع الحقوق محفوظة.
        </p>
        <p style="margin: 0; font-size: 12px; opacity: 0.6;">
          منصة تذكرتي - الحل الأمثل لحجز تذاكر الأحداث
        </p>
      </div>
    </div>
  </body>
  </html>`;
};

/**
 * قالب إشعار إلغاء الحجز
 */
export const generateBookingCancellationEmail = (booking, reason) => {
  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إلغاء الحجز - تذكرتي</title>
    <style>
      body { 
        font-family: 'Segoe UI', 'Cairo', Tahoma, Geneva, Verdana, sans-serif; 
        margin: 0; 
        padding: 20px; 
        background-color: #f8f9fa;
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white; 
        border-radius: 10px; 
        overflow: hidden; 
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header { 
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
        color: white; 
        padding: 30px 20px; 
        text-align: center; 
      }
      .content { padding: 30px 20px; }
      .booking-info { 
        background-color: #f8f9fa; 
        padding: 20px; 
        border-radius: 8px; 
        margin: 20px 0;
        border-right: 4px solid #dc3545;
      }
      .footer { 
        background-color: #2c3e50; 
        color: white; 
        padding: 20px; 
        text-align: center; 
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>❌ تم إلغاء حجزك</h1>
        <p>مرحباً ${booking.attendeeInfo.name}</p>
      </div>
      
      <div class="content">
        <p>نأسف لإعلامك بأنه تم إلغاء حجزك للأسباب التالية:</p>
        
        <div class="booking-info">
          <p><strong>رقم الحجز:</strong> ${booking.bookingCode}</p>
          <p><strong>اسم الحدث:</strong> ${booking.event.title}</p>
          <p><strong>التاريخ:</strong> ${new Date(
            booking.event.startDate
          ).toLocaleDateString("ar-EG")}</p>
          <p><strong>سبب الإلغاء:</strong> ${reason}</p>
        </div>

        <p>سيتم استرداد المبلغ المدفوع خلال 5-7 أيام عمل.</p>
        <p>في حالة وجود أي استفسارات، يرجى التواصل معنا.</p>
      </div>
      
      <div class="footer">
        <p>شكراً لتفهمكم</p>
        <p>© ${new Date().getFullYear()} Tazkarti. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </body>
  </html>`;
};

/**
 * قالب تذكير بالحدث
 */
export const generateEventReminderEmail = (booking, hoursUntilEvent) => {
  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تذكير بالحدث - تذكرتي</title>
    <style>
      body { 
        font-family: 'Segoe UI', 'Cairo', Tahoma, Geneva, Verdana, sans-serif; 
        margin: 0; 
        padding: 20px; 
        background-color: #f8f9fa;
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background-color: white; 
        border-radius: 10px; 
        overflow: hidden; 
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header { 
        background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%); 
        color: white; 
        padding: 30px 20px; 
        text-align: center; 
      }
      .content { padding: 30px 20px; }
      .countdown { 
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        padding: 25px; 
        border-radius: 10px; 
        text-align: center;
        margin: 20px 0;
        border: 2px solid #2196f3;
      }
      .footer { 
        background-color: #2c3e50; 
        color: white; 
        padding: 20px; 
        text-align: center; 
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>⏰ تذكير بالحدث</h1>
        <p>مرحباً ${booking.attendeeInfo.name}</p>
      </div>
      
      <div class="content">
        <div class="countdown">
          <h2 style="color: #1976d2; margin-top: 0;">
            ${hoursUntilEvent} ساعة متبقية!
          </h2>
          <p style="font-size: 18px; margin: 0;">
            حتى بداية حدث <strong>${booking.event.title}</strong>
          </p>
        </div>

        <p>لا تنس:</p>
        <ul style="text-align: right;">
          <li>إحضار رمز QR أو رقم الحجز: <strong>${
            booking.bookingCode
          }</strong></li>
          <li>الوصول قبل الموعد بـ 30 دقيقة</li>
          <li>التأكد من شحن بطارية الهاتف</li>
        </ul>

        <p style="text-align: center; margin: 30px 0;">
          <strong>نتطلع لرؤيتك في الحدث! 🎉</strong>
        </p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Tazkarti. جميع الحقوق محفوظة.</p>
      </div>
    </div>
  </body>
  </html>`;
};
