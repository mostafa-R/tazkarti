import axios from "axios";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentAPI } from "../services/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvv: "",
  });

  // استخدام useMemo لتجنب تغيير التبعيات في كل رندر
  const eventData = useMemo(
    () =>
      location.state?.eventData ||
    [location.state?.eventData]
  );

  const bookingData = useMemo(
    () => location.state?.bookingData || {},
    [location.state?.bookingData]
  );

  const paymentDetails = useMemo(
    () => bookingData.paymentDetails || {},
    [bookingData.paymentDetails]
  );

  const orderSummary = {
    ticketType: bookingData.selectedTicket?.type || "Standard Ticket",
    quantity: bookingData.quantity || 1,
    pricePerTicket: bookingData.selectedTicket?.price || 0,
    serviceFee: bookingData.serviceFee || 5.0,
    total: bookingData.total || 0,
    currency: bookingData.selectedTicket?.currency || "EGP",
    bookingId: bookingData.bookingId,
    bookingCode: bookingData.bookingCode,
  };

  // التحقق من وجود بيانات الحجز الأساسية المطلوبة
  useEffect(() => {
    // تحقق من وجود البيانات الأساسية فقط: bookingCode أو bookingId
    if (!location.state || (!bookingData.bookingCode && !bookingData.bookingId)) {
      setMessage("⚠️ بيانات الحجز غير كاملة، يرجى العودة لصفحة الحجز");
      setPaymentStatus("error");
      console.error("Missing essential booking data:", bookingData);
    } else {
      // تسجيل توفر بيانات الحجز
      console.log("Booking data available:", {
        bookingId: bookingData.bookingId,
        bookingCode: bookingData.bookingCode,
        hasPaymentDetails: !!bookingData.paymentDetails,
        hasSelectedTicket: !!bookingData.selectedTicket,
      });
    }
  }, [location.state, bookingData]);

  const handlePaymentSuccess = useCallback(
    (paymentData) => {
      setMessage("✅ تم الدفع بنجاح!");
      setPaymentStatus("success");

      // الانتقال إلى صفحة تأكيد الحجز
      setTimeout(() => {
        navigate("/booking-confirmation", {
          state: {
            bookingData: {
              ...bookingData,
              paymentId: paymentData.paymentId,
              paymentStatus: paymentData.paymentStatus,
              bookingId: orderSummary.bookingId,
              bookingCode: orderSummary.bookingCode,
              event: eventData,
              ticket: {
                type: orderSummary.ticketType,
                quantity: orderSummary.quantity,
                price: orderSummary.total,
                currency: orderSummary.currency,
              },
              customer: bookingData.customerInfo,
            },
          },
        });
      }, 1500);
    },
    [bookingData, orderSummary, eventData, navigate]
  );

  // التحقق من حالة الدفع عند العودة من 3D Secure
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get("cko-session-id");
      const paymentId = urlParams.get("cko-payment-id");
      const reference = bookingData.bookingCode;

      if ((sessionId || paymentId) && reference) {
        setVerifyingPayment(true);
        try {
          // التحقق من حالة الدفع باستخدام المرجع (reference)
          const response = await paymentAPI.verifyPaymentStatus(reference);

          if (response.data.success) {
            const { bookingStatus, paymentStatus } = response.data.data;

            if (
              paymentStatus === "completed" &&
              bookingStatus === "confirmed"
            ) {
              handlePaymentSuccess(response.data.data);
            } else if (paymentStatus === "failed") {
              setMessage("❌ فشل الدفع. يرجى المحاولة مرة أخرى.");
              setPaymentStatus("error");
            } 
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          setMessage("⚠️ حدث خطأ في التحقق من حالة الدفع");
          setPaymentStatus("error");
        } finally {
          setVerifyingPayment(false);
        }
      }
    };

    if (bookingData && bookingData.bookingCode) {
      checkPaymentStatus();
    }
  }, [bookingData, handlePaymentSuccess]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formatted.length <= 19) {
        setCardData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    if (name === "expiryDate") {
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2");
      if (formatted.length <= 5) {
        setCardData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    if (name === "cvv") {
      const formatted = value.replace(/\D/g, "");
      if (formatted.length <= 3) {
        setCardData((prev) => ({ ...prev, [name]: formatted }));
      }
      return;
    }

    setCardData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const isFormValid = useCallback(() => {
    return (
      cardData.cardNumber.replace(/\s/g, "").length === 16 &&
      cardData.nameOnCard.length > 0 &&
      cardData.expiryDate.length === 5 &&
      cardData.cvv.length === 3
    );
  }, [cardData]);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setMessage("⚠️ يرجى ملء جميع الحقول بشكل صحيح");
      return;
    }

    setLoading(true);
    setMessage("");
    setPaymentStatus("pending");

    try {
      // التحقق من بيانات الحجز ووضع قيم افتراضية إذا كانت غير موجودة
      const paymentAmount = paymentDetails?.amount || orderSummary.total * 100; // تحويل إلى cents
      const paymentCurrency = paymentDetails?.currency || orderSummary.currency || "EGP";
      
      if (!paymentAmount) {
        throw new Error("لا يمكن تحديد مبلغ الدفع");
      }
      
      console.log("Processing payment:", {
        amount: paymentAmount,
        currency: paymentCurrency,
        bookingCode: bookingData.bookingCode,
      });

      // 1️⃣ فصل تاريخ الانتهاء (MM/YY)
      const [expiryMonth, expiryYear] = cardData.expiryDate.split("/");

      // استخدام المتغيرات البيئية
      const CKO_API_URL =
        import.meta.env.VITE_CKO_API_URL || "https://api.sandbox.checkout.com";

      const CKO_PUBLIC_KEY = import.meta.env.VITE_CKO_PUBLIC_KEY;

      if (!CKO_PUBLIC_KEY) {
        throw new Error("مفتاح الدفع غير متوفر");
      }

      // 2️⃣ إنشاء توكن للكارت باستخدام Checkout.com API
      const tokenRes = await axios.post(
        `${CKO_API_URL}/tokens`,
        {
          type: "card",
          number: cardData.cardNumber.replace(/\s/g, ""),
          expiry_month: parseInt(expiryMonth, 10),
          expiry_year: parseInt(`20${expiryYear}`, 10),
          cvv: cardData.cvv,
          name: cardData.nameOnCard,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: CKO_PUBLIC_KEY,
          },
        }
      );

      if (!tokenRes.data.token) {
        throw new Error("فشل في إنشاء رمز البطاقة");
      }

      const cardToken = tokenRes.data.token;

      // 3️⃣ إرسال التوكن للباكاند مع معلومات الدفع
      // سبق وقمنا بتحديد المبلغ في القسم السابق (paymentAmount)
      // الآن نتأكد من أن المبلغ عدد صحيح (بالـ cents/pennies)
      const finalAmount = Number.isInteger(paymentAmount) 
        ? paymentAmount 
        : Math.round(paymentAmount);
        
      console.log('Payment amount in cents:', finalAmount);
      
      const paymentRes = await paymentAPI.payWithToken({
        token: cardToken,
        amount: finalAmount, // استخدام القيمة المعدلة التي تأكدنا أنها رقم صحيح
        currency: paymentCurrency, // استخدام العملة التي حددناها سابقًا
        reference: bookingData.bookingCode || `order_${Date.now()}`,
        customer: {
          email: bookingData.customerInfo?.email || 'customer@example.com',
          name: bookingData.customerInfo?.fullName || cardData.nameOnCard,
          phone: bookingData.customerInfo?.phone,
        },
        metadata: {
          ...(paymentDetails.metadata || {}),
          bookingId: orderSummary.bookingId || bookingData.bookingId,
          eventId: eventData.id,
          orderTotal: orderSummary.total,
        },
        threeDS: true, // تفعيل 3D Secure
        success_url: `${window.location.origin}/booking-confirmation?success=true&bookingCode=${bookingData.bookingCode || ''}&paymentId=${Date.now()}`,
        failure_url: `${window.location.origin}/booking-confirmation?success=false&bookingCode=${bookingData.bookingCode || ''}&paymentId=${Date.now()}`,
      });

      const data = paymentRes.data;

      // 4️⃣ التعامل مع نتيجة الدفع
      if (data.success) {
        if (data.data.requires_redirect) {
          // إعادة التوجيه إلى صفحة مصادقة 3D Secure
          setMessage("🔐 جاري التوجيه للمصادقة الآمنة...");
          window.location.href = data.data.redirect_url;
        } else if (data.data.approved) {
          // الدفع نجح بدون حاجة لمصادقة 3D Secure
          handlePaymentSuccess(data.data);
        } else {
          // الدفع لم ينجح
          setMessage(
            `❌ فشل الدفع: ${data.data.response_summary || "خطأ غير معروف"}`
          );
          setPaymentStatus("error");
        }
      } else {
        throw new Error(data.message || "فشل في معالجة الدفع");
      }
    } catch (error) {
      console.error("خطأ في عملية الدفع:", error);

      let errorMessage = "⚠️ حدث خطأ أثناء الدفع";

      if (error.response?.data?.message) {
        errorMessage = `⚠️ ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `⚠️ ${error.message}`;
      }

      setMessage(errorMessage);
      setPaymentStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // إعادة محاولة الدفع للحجوزات الفاشلة
  const handleRetryPayment = async () => {
    if (!orderSummary.bookingId) {
      setMessage("⚠️ معرف الحجز غير متوفر");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // إنشاء توكن جديد للبطاقة
      const [expiryMonth, expiryYear] = cardData.expiryDate.split("/");
      const CKO_API_URL =
        import.meta.env.VITE_CKO_API_URL || "https://api.sandbox.checkout.com";
      const CKO_PUBLIC_KEY = import.meta.env.VITE_CKO_PUBLIC_KEY;

      const tokenRes = await axios.post(
        `${CKO_API_URL}/tokens`,
        {
          type: "card",
          number: cardData.cardNumber.replace(/\s/g, ""),
          expiry_month: parseInt(expiryMonth, 10),
          expiry_year: parseInt(`20${expiryYear}`, 10),
          cvv: cardData.cvv,
          name: cardData.nameOnCard,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: CKO_PUBLIC_KEY,
          },
        }
      );

      // إعادة محاولة الدفع
      const retryRes = await paymentAPI.retryPayment(orderSummary.bookingId, {
        token: tokenRes.data.token,
      });

      if (retryRes.data.success) {
        const data = retryRes.data.data;
        if (data.requires_redirect) {
          window.location.href = data.redirect_url;
        } else if (data.approved) {
          handlePaymentSuccess(data);
        } else {
          setMessage(`❌ فشل الدفع: ${data.response_summary}`);
          setPaymentStatus("error");
        }
      }
    } catch (error) {
      console.error("Error retrying payment:", error);
      setMessage("⚠️ فشلت إعادة المحاولة");
      setPaymentStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // إلغاء الدفع والعودة
  const handleCancelPayment = async () => {
    if (orderSummary.bookingId) {
      try {
        await paymentAPI.cancelPayment(orderSummary.bookingId);
      } catch (error) {
        console.error("Error cancelling payment:", error);
      }
    }
    navigate(-1);
  };

  // عرض شاشة التحقق من الدفع
  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            جاري التحقق من حالة الدفع
          </h2>
          <p className="text-gray-600">
            يرجى الانتظار بينما نتحقق من حالة دفعتك...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Secure checkout for your ticket booking
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Information
              </h2>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Name on Card
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="nameOnCard"
                      value={cardData.nameOnCard}
                      onChange={handleInputChange}
                      placeholder="John Smith"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Expiry Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      CVV
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">
                        Your payment is encrypted and secure
                      </h4>
                      <p className="text-sm text-green-700">
                        We use industry-standard SSL encryption to protect your
                        payment information. 3D Secure authentication is enabled
                        for your safety.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Status Messages */}
                {message && (
                  <div
                    className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
                      paymentStatus === "success"
                        ? "bg-green-50 text-green-800"
                        : paymentStatus === "error"
                        ? "bg-red-50 text-red-800"
                        : "bg-blue-50 text-blue-800"
                    }`}
                  >
                    {paymentStatus === "success" ? (
                      <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : paymentStatus === "error" ? (
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Loader2 className="h-5 w-5 mt-0.5 flex-shrink-0 animate-spin" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{message}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                      isFormValid() && !loading
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    } ${
                      paymentStatus === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }`}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        جارِ معالجة الدفع...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        تأكيد الدفع - {orderSummary.total.toFixed(2)}{" "}
                        {orderSummary.currency}
                      </>
                    )}
                  </button>

                  {paymentStatus === "error" && orderSummary.bookingId && (
                    <button
                      type="button"
                      onClick={handleRetryPayment}
                      className="w-full py-3 px-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                      disabled={loading || !isFormValid()}
                    >
                      إعادة المحاولة
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    disabled={loading}
                  >
                    إلغاء والعودة
                  </button>
                </div>
              </form>
            </div>

            {/* Payment Methods Accepted */}
            {/* <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Accepted Payment Methods
              </h3>
              <div className="flex items-center space-x-4">
                <img src="/visa.svg" alt="Visa" className="h-8" />
                <img src="/mastercard.svg" alt="Mastercard" className="h-8" />
                <img src="/amex.svg" alt="American Express" className="h-8" />
              </div>
            </div> */}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h3>

              {/* Event Details */}
              <div className="flex space-x-3 mb-6">
                {eventData.images?.[0] && (
                  <img
                    src={eventData.images[0]}
                    alt={eventData.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    {eventData.title}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{eventData.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{eventData.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">
                        {typeof eventData.location === "object"
                          ? eventData.location.venue
                            ? `${eventData.location.venue}${
                                eventData.location.address
                                  ? `, ${eventData.location.address}`
                                  : ""
                              }`
                            : eventData.location.address ||
                              "Location not available"
                          : eventData.location || "Location not available"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Reference */}
              {orderSummary.bookingCode && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">
                    Booking Reference
                  </p>
                  <p className="font-mono font-bold text-gray-900">
                    {orderSummary.bookingCode}
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Type</span>
                  <span className="font-medium">{orderSummary.ticketType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">×{orderSummary.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per ticket</span>
                  <span className="font-medium">
                    {orderSummary.pricePerTicket.toFixed(2)}{" "}
                    {orderSummary.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium">
                    {orderSummary.serviceFee.toFixed(2)} {orderSummary.currency}
                  </span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {orderSummary.total.toFixed(2)} {orderSummary.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              {bookingData.customerInfo && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-2 font-medium">
                    Customer Details
                  </p>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>{bookingData.customerInfo.fullName}</p>
                    <p>{bookingData.customerInfo.email}</p>
                    {bookingData.customerInfo.phone && (
                      <p>{bookingData.customerInfo.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                By completing this purchase, you agree to our{" "}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
