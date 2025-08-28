import axios from "axios";
import {
  Calendar,
  Clock,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { paymentAPI } from "../services/api";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success, error
  const [cardData, setCardData] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvv: "",
  });

  // استخدام useMemo لتجنب تغيير التبعيات في كل رندر
  const eventData = useMemo(
    () =>
      location.state?.eventData || {
        title: "Event Title",
        date: new Date().toLocaleDateString(),
        time: "7:00 PM",
        location: "Venue Location",
        images: ["https://via.placeholder.com/120"],
      },
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

  // التحقق من وجود بيانات الدفع المطلوبة
  useEffect(() => {
    if (!location.state || !bookingData.paymentDetails) {
      setMessage("⚠️ بيانات الحجز غير كاملة، يرجى العودة لصفحة الحجز");
    }
  }, [location.state, bookingData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const formatted = value
        .replace(/\s/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
      if (formatted.length <= 19) {
        setCardData({ ...cardData, [name]: formatted });
      }
      return;
    }

    if (name === "expiryDate") {
      const formatted = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2");
      if (formatted.length <= 5) {
        setCardData({ ...cardData, [name]: formatted });
      }
      return;
    }

    if (name === "cvv") {
      const formatted = value.replace(/\D/g, "");
      if (formatted.length <= 3) {
        setCardData({ ...cardData, [name]: formatted });
      }
      return;
    }

    setCardData({ ...cardData, [name]: value });
  };

  const isFormValid = () => {
    return (
      cardData.cardNumber.replace(/\s/g, "").length === 16 &&
      cardData.nameOnCard.length > 0 &&
      cardData.expiryDate.length === 5 &&
      cardData.cvv.length === 3
    );
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setPaymentStatus("pending");

    try {
      // التحقق من بيانات الحجز
      if (
        !paymentDetails ||
        !paymentDetails.amount ||
        !paymentDetails.currency
      ) {
        throw new Error("بيانات الدفع غير مكتملة");
      }

      // 1️⃣ فصل تاريخ الانتهاء (MM/YY)
      const [expiryMonth, expiryYear] = cardData.expiryDate.split("/");

      // عنوان API للتطوير وللإنتاج
      const CKO_API_URL = "https://api.sandbox.checkout.com";
      // مفتاح API العام
      const CKO_PUBLIC_KEY = "pk_sbox_hp5vsh2prvoy3ez5gh2labufvys";

      // 2️⃣ إنشاء توكن للكارت باستخدام Checkout.com API
      const tokenRes = await axios.post(
        `${CKO_API_URL}/tokens`,
        {
          type: "card",
          number: cardData.cardNumber.replace(/\s/g, ""),
          expiry_month: expiryMonth,
          expiry_year: `20${expiryYear}`, // تحويل YY إلى YYYY
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

      const cardToken = tokenRes.data.token;

      // 3️⃣ إرسال التوكن للباكاند مع معلومات الدفع من الحجز المؤقت
      const paymentRes = await paymentAPI.payWithToken({
        token: cardToken,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        reference: paymentDetails.reference, // رمز الحجز المرجعي
        customer: {
          email:
            bookingData.customerInfo?.email || paymentDetails.customer?.email,
          name:
            bookingData.customerInfo?.fullName || paymentDetails.customer?.name,
          phone:
            bookingData.customerInfo?.phone || paymentDetails.customer?.phone,
        },
        metadata: paymentDetails.metadata, // بيانات إضافية (bookingId, eventId, etc.)
      });

      const data = paymentRes.data;

      // 4️⃣ التعامل مع نتيجة الدفع
      if (data.requires_redirect) {
        // إعادة التوجيه إلى صفحة مصادقة 3D Secure
        window.location.href = data.redirect_url;
      } else if (data.approved) {
        // الدفع نجح بدون حاجة لمصادقة 3D Secure
        setMessage("✅ تم الدفع بنجاح!");
        setPaymentStatus("success");

        // الانتقال إلى صفحة تأكيد الحجز
        setTimeout(() => {
          navigate("/booking-confirmation", {
            state: {
              bookingData: {
                ...bookingData,
                paymentId: data.id,
                paymentStatus: data.status,
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
        }, 1000);
      } else {
        // الدفع لم ينجح
        setMessage(`❌ فشل الدفع: ${data.response_summary || "خطأ غير معروف"}`);
        setPaymentStatus("error");
      }
    } catch (error) {
      console.error("خطأ في عملية الدفع:", error);
      setMessage(
        `⚠️ حدث خطأ أثناء الدفع: ${
          error.response?.data?.message || error.message
        }`
      );
      setPaymentStatus("error");
    } finally {
      setLoading(false);
    }
  };

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
                        payment information.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isFormValid() && !loading
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } ${
                    paymentStatus === "success"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  } ${
                    paymentStatus === "error"
                      ? "bg-red-600 hover:bg-red-700"
                      : ""
                  }`}
                  disabled={!isFormValid() || loading}
                >
                  <div className="flex items-center justify-center">
                    <Lock className="h-5 w-5 mr-2" />
                    {loading
                      ? "جارِ المعالجة..."
                      : `تأكيد الدفع - ${orderSummary.total.toFixed(2)} ${
                          orderSummary.currency
                        }`}
                  </div>
                </button>

                {message && (
                  <div
                    className={`mt-4 p-3 rounded-lg text-center ${
                      paymentStatus === "success"
                        ? "bg-green-100 text-green-700"
                        : paymentStatus === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {paymentStatus === "error" && (
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full mt-3 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                  >
                    العودة إلى صفحة الحجز
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h3>
              <div className="flex space-x-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
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
                      <span>{eventData.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ticket Type</span>
                  <span className="font-medium">{orderSummary.ticketType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">{orderSummary.quantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per ticket</span>
                  <span className="font-medium">
                    ${orderSummary.pricePerTicket.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-medium">
                    ${orderSummary.serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-yellow-600">
                      ${orderSummary.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing this purchase, you agree to our Terms of Service
                and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
