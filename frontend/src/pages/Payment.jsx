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
import { useState } from "react";

const PaymentPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvv: "",
  });

  const eventData = {
    title: "Summer Music Festival 2025",
    date: "July 15, 2025",
    time: "7:00 PM",
    location: "Central Park Amphitheater",
  };

  const orderSummary = {
    ticketType: "VIP Premium",
    quantity: 2,
    pricePerTicket: 125.0,
    serviceFee: 15.0,
    total: 265.0,
  };

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

    try {
      // فصل تاريخ الانتهاء (MM/YY)
      const [expiryMonth, expiryYear] = cardData.expiryDate.split("/");

      // 1️⃣ إنشاء توكن للكارت
      const tokenRes = await axios.post(
        "https://api.sandbox.checkout.com/tokens",
        {
          type: "card",
          number: cardData.cardNumber.replace(/\s/g, ""),
          expiry_month: expiryMonth,
          expiry_year: `20${expiryYear}`, // من YY → YYYY
          cvv: cardData.cvv,
          name: cardData.nameOnCard,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "pk_sbox_hp5vsh2prvoy3ez5gh2labufvys", // 🔑 الـ Public Key
          },
        }
      );

      const cardToken = tokenRes.data.token;

      // 2️⃣ إرسال التوكن للـ Backend
      const paymentRes = await axios.post(
        "https://tazkaritbackend.fly.dev/api/booking/checkout/pay-with-token",
        {
          token: cardToken,
          amount: orderSummary.total * 100, // أقل وحدة (cents)
          currency: "USD",
        },
        { withCredentials: true }
      );

      const data = paymentRes.data;

      if (data.requires_redirect) {
        window.location.href = data.redirect_url; // 3DS redirect
      } else {
        console.log("Payment status:", data.status);
        setMessage(
          data.status === "Authorized" ? "✅ تم الدفع بنجاح!" : "❌ فشل الدفع"
        );
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      setMessage("⚠️ حصل خطأ أثناء الدفع");
    }

    setLoading(false);
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
                    isFormValid()
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!isFormValid() || loading}
                >
                  <div className="flex items-center justify-center">
                    <Lock className="h-5 w-5 mr-2" />
                    {loading
                      ? "Processing..."
                      : `Confirm Payment - $${orderSummary.total.toFixed(2)}`}
                  </div>
                </button>
                {message && <p className="mt-4">{message}</p>}
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
