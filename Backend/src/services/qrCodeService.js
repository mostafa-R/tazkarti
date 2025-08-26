import crypto from "crypto";
import QRCode from "qrcode";

/**
 * خدمة توليد رموز QR للتذاكر
 */
class QRCodeService {
  /**
   * توليد QR Code للتذكرة
   * @param {Object} ticketData - بيانات التذكرة
   * @returns {Promise<Object>} - يحتوي على الرمز والبيانات المشفرة
   */
  static async generateTicketQR(ticketData) {
    try {
      const {
        bookingId,
        bookingCode,
        eventId,
        userId,
        attendeeName,
        attendeeEmail,
        ticketType,
        quantity,
        eventDate,
        eventTitle,
        eventLocation,
      } = ticketData;

      // إنشاء بيانات مشفرة للحماية من التزوير
      const secureData = {
        bookingId: bookingId.toString(),
        bookingCode,
        eventId: eventId.toString(),
        userId: userId.toString(),
        attendeeName,
        attendeeEmail,
        ticketType,
        quantity,
        eventDate: eventDate.toISOString(),
        timestamp: new Date().toISOString(),
      };

      // إنشاء توقيع رقمي للتحقق من صحة التذكرة
      const signature = this.createSignature(secureData);
      secureData.signature = signature;

      // تحويل البيانات إلى JSON مشفر
      const encryptedData = this.encryptData(JSON.stringify(secureData));

      // إنشاء URL للتحقق من التذكرة
      const verificationUrl = `${process.env.APP_BASE_URL}/api/tickets/verify?token=${encryptedData}`;

      // توليد QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: "H", // مستوى تصحيح عالي
        type: "image/png",
        quality: 0.92,
        margin: 1,
        width: 300,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      // توليد QR Code كـ SVG أيضاً
      const qrCodeSVG = await QRCode.toString(verificationUrl, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
      });

      return {
        qrCodeDataUrl, // Base64 Data URL للصورة
        qrCodeSVG, // SVG string
        verificationUrl,
        encryptedToken: encryptedData,
        ticketInfo: {
          bookingCode,
          eventTitle,
          attendeeName,
          eventDate: eventDate.toLocaleDateString("ar-EG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          eventLocation,
          ticketType,
          quantity,
        },
      };
    } catch (error) {
      console.error("Error generating QR code:", error);
      throw new Error(`فشل في توليد رمز QR: ${error.message}`);
    }
  }

  /**
   * إنشاء توقيع رقمي للبيانات
   * @param {Object} data - البيانات المراد توقيعها
   * @returns {string} - التوقيع
   */
  static createSignature(data) {
    const secret =
      process.env.QR_CODE_SECRET || "default-secret-key-change-this";
    const dataString = JSON.stringify(data);
    return crypto.createHmac("sha256", secret).update(dataString).digest("hex");
  }

  /**
   * التحقق من التوقيع الرقمي
   * @param {Object} data - البيانات
   * @param {string} signature - التوقيع
   * @returns {boolean} - صحة التوقيع
   */
  static verifySignature(data, signature) {
    const expectedSignature = this.createSignature(data);
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  }

  /**
   * تشفير البيانات
   * @param {string} text - النص المراد تشفيره
   * @returns {string} - النص المشفر
   */
  static encryptData(text) {
    const algorithm = "aes-256-gcm";
    const secretKey =
      process.env.ENCRYPTION_KEY || "default-encryption-key-32-chars!!";
    const key = crypto.scryptSync(secretKey, "salt", 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipherGCM(algorithm, key, iv);
    cipher.setAAD(Buffer.from("ticket-verification", "utf8"));

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return Buffer.from(
      JSON.stringify({
        iv: iv.toString("hex"),
        encrypted,
        authTag: authTag.toString("hex"),
      })
    ).toString("base64url");
  }

  /**
   * فك تشفير البيانات
   * @param {string} encryptedData - البيانات المشفرة
   * @returns {string} - النص الأصلي
   */
  static decryptData(encryptedData) {
    try {
      const algorithm = "aes-256-gcm";
      const secretKey =
        process.env.ENCRYPTION_KEY || "default-encryption-key-32-chars!!";
      const key = crypto.scryptSync(secretKey, "salt", 32);

      const data = JSON.parse(
        Buffer.from(encryptedData, "base64url").toString()
      );
      const { iv, encrypted, authTag } = data;

      const decipher = crypto.createDecipherGCM(
        algorithm,
        key,
        Buffer.from(iv, "hex")
      );
      decipher.setAAD(Buffer.from("ticket-verification", "utf8"));
      decipher.setAuthTag(Buffer.from(authTag, "hex"));

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error("فشل في فك تشفير البيانات");
    }
  }

  /**
   * التحقق من صحة التذكرة من خلال QR Code
   * @param {string} token - الرمز المشفر
   * @returns {Object} - نتيجة التحقق
   */
  static async verifyTicket(token) {
    try {
      // فك تشفير البيانات
      const decryptedData = this.decryptData(token);
      const ticketData = JSON.parse(decryptedData);

      // التحقق من التوقيع
      const { signature, ...dataToVerify } = ticketData;
      const isValidSignature = this.verifySignature(dataToVerify, signature);

      if (!isValidSignature) {
        return {
          valid: false,
          error: "توقيع غير صحيح - التذكرة قد تكون مزورة",
        };
      }

      // التحقق من تاريخ الصلاحية (التذكرة صالحة لمدة 24 ساعة بعد الحدث)
      const eventDate = new Date(ticketData.eventDate);
      const expiryDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);

      if (new Date() > expiryDate) {
        return {
          valid: false,
          error: "التذكرة منتهية الصلاحية",
          ticketData,
        };
      }

      return {
        valid: true,
        ticketData,
        message: "التذكرة صحيحة ومتاحة للاستخدام",
      };
    } catch (error) {
      return {
        valid: false,
        error: "فشل في التحقق من التذكرة: " + error.message,
      };
    }
  }

  /**
   * توليد QR Code للمنظم لقراءة التذاكر
   * @param {string} eventId - معرف الحدث
   * @returns {Promise<string>} - QR Code للمسح
   */
  static async generateEventScannerQR(eventId) {
    try {
      const scannerUrl = `${process.env.APP_BASE_URL}/scanner/${eventId}`;

      const qrCodeDataUrl = await QRCode.toDataURL(scannerUrl, {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.92,
        margin: 2,
        width: 400,
        color: {
          dark: "#1a365d",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("Error generating scanner QR code:", error);
      throw new Error(`فشل في توليد رمز الماسح: ${error.message}`);
    }
  }

  /**
   * توليد QR Code مخصص مع تنسيق معين
   * @param {string} data - البيانات
   * @param {Object} options - خيارات التنسيق
   * @returns {Promise<string>} - QR Code
   */
  static async generateCustomQR(data, options = {}) {
    const defaultOptions = {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      width: 200,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    };

    const qrOptions = { ...defaultOptions, ...options };

    try {
      return await QRCode.toDataURL(data, qrOptions);
    } catch (error) {
      console.error("Error generating custom QR code:", error);
      throw new Error(`فشل في توليد رمز QR مخصص: ${error.message}`);
    }
  }
}

export default QRCodeService;
