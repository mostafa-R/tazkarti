import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Loader,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Share2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { bookingAPI } from "../services/api";

const BookingConfirmationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // الحصول على بيانات الحجز الأولية من حالة الانتقال
  const initialBookingData = location.state?.bookingData;

  // إنشاء حالة لبيانات الحجز يمكن تحديثها
  const [bookingDetails, setBookingDetails] = useState({
    event: { title: "", date: "", location: { venue: "", city: "" }, time: "" },
    ticket: { type: "", quantity: 0, price: 0, currency: "" },
    customer: { name: "", email: "", phone: "", bookingCode: "" },
    status: "",
    paymentStatus: "",
    bookingId: "",
    bookingCode: "",
    qrCode: ""
  });

  // التحقق من حالة الحجز النهائية من الباكاند
  useEffect(() => {
    const fetchBookingStatus = async () => {
      // تحقق من وجود معلمات URL أولاً
      const urlParams = new URLSearchParams(window.location.search);
      const bookingCodeFromUrl = urlParams.get("bookingCode");
      const success = urlParams.get("success");
      
      // إذا كان هناك bookingCode في URL، استخدمه
      if (bookingCodeFromUrl) {
        setLoading(true);
        setError("");
        
        try {
          // استدعاء API للحصول على تفاصيل التذكرة باستخدام bookingCode من URL
          const response = await bookingAPI.getTicketDetails(bookingCodeFromUrl);
          
          if (response.data && response.data.success) {
            const bookingData = response.data.data;
            
            // تحديث بيانات الحجز من الاستجابة
            setBookingDetails({
              status: bookingData.bookingStatus || bookingData.status || "",
              paymentStatus: bookingData.paymentStatus || "",
              qrCode: bookingData.qrCode || "",
              event: {
                title: bookingData.event?.title || "",
                date: bookingData.event?.startDate || bookingData.event?.date || "",
                location: {
                  venue: bookingData.event?.location?.venue || "",
                  city: bookingData.event?.location?.city || "",
                },
                time: bookingData.event?.time || "",
              },
              ticket: {
                type: bookingData.ticket?.type || "",
                quantity: bookingData.quantity || 0,
                price: bookingData.totalPrice || bookingData.ticket?.price || 0,
                currency: bookingData.ticket?.currency || "",
              },
              customer: {
                name: bookingData.attendeeInfo?.name || "",
                email: bookingData.attendeeInfo?.email || "",
                phone: bookingData.attendeeInfo?.phone || "",
                bookingCode: bookingData.bookingCode || "",
              },
              bookingCode: bookingData.bookingCode || "",
              bookingId: bookingData._id || "",
              bookingDate: bookingData.createdAt || "",
              paymentDate: bookingData.paymentDate || "",
            });
          } else {
            setError(t("confirmation.errors.fetchFailed"));
          }
        } catch (error) {
          console.error("خطأ في جلب تفاصيل الحجز من URL:", error);
          setError(t("confirmation.errors.fetchFailed"));
        } finally {
          setLoading(false);
        }
        return;
      }
      
      // استخدام initialBookingData إذا لم يكن هناك معلمات URL
      if (initialBookingData) {
        setBookingDetails({
          status: initialBookingData.status || "",
          paymentStatus: initialBookingData.paymentStatus || "",
          qrCode: initialBookingData.qrCode || "",
          event: {
            title: initialBookingData.event?.title || "",
            date: initialBookingData.event?.date || "",
            location: {
              venue: initialBookingData.event?.location?.venue || "",
              city: initialBookingData.event?.location?.city || "",
            },
            time: initialBookingData.event?.time || "",
          },
          ticket: {
            type: initialBookingData.ticket?.type || "",
            quantity: initialBookingData.ticket?.quantity || 0,
            price: initialBookingData.ticket?.price || 0,
            currency: initialBookingData.ticket?.currency || "",
          },
          customer: {
            name: initialBookingData.customer?.name || "",
            email: initialBookingData.customer?.email || "",
            phone: initialBookingData.customer?.phone || "",
            bookingCode: initialBookingData.customer?.bookingCode || initialBookingData.bookingCode || "",
          },
          bookingCode: initialBookingData.bookingCode || "",
          bookingId: initialBookingData.bookingId || "",
          bookingDate: initialBookingData.bookingDate || "",
          paymentDate: initialBookingData.paymentDate || "",
        });
        
        // إذا كان هناك bookingId، قم بجلب أحدث البيانات من الخادم
        if (initialBookingData.bookingId) {
          setLoading(true);
          
          try {
            const response = await bookingAPI.getTicketDetails(initialBookingData.bookingId);
            
            if (response.data && response.data.success) {
              const serverData = response.data.data;
              
              setBookingDetails(prev => ({
                ...prev,
                status: serverData.bookingStatus || serverData.status || prev.status,
                paymentStatus: serverData.paymentStatus || prev.paymentStatus,
                qrCode: serverData.qrCode || prev.qrCode,
                bookingCode: serverData.bookingCode || prev.bookingCode,
                bookingDate: serverData.createdAt || prev.bookingDate,
                paymentDate: serverData.paymentDate || prev.paymentDate,
              }));
            }
          } catch (error) {
            console.error("خطأ في جلب تفاصيل الحجز من الخادم:", error);
          } finally {
            setLoading(false);
          }
        }
      } else {
        // لا توجد بيانات للحجز
        setError(t("confirmation.errors.noBookingData"));
      }
    };

    fetchBookingStatus();
  }, [initialBookingData, t]);

  const handleGoToTickets = () => {
    navigate("/my-tickets");
  };

  const handleBackToEvents = () => {
    navigate("/events");
  };
  
  const handleDownloadTicket = async (bookingId) => {
    if (!bookingId) {
      setError(t("confirmation.errors.noBookingId"));
      return;
    }
    
    try {
      setLoading(true);
      const response = await bookingAPI.downloadTicket(bookingId);
      
      // إنشاء رابط تنزيل للملف
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("خطأ في تنزيل التذكرة:", error);
      setError(t("confirmation.errors.downloadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return t("confirmation.dateNotSpecified");
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(navigator.language, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicators */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center flex-wrap gap-y-4">
            <div className="flex items-center space-x-2 px-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">
                {t("confirmation.progress.eventSelected")}
              </span>
            </div>

            <div className="w-16 h-0.5 bg-green-500 hidden sm:block"></div>

            <div className="flex items-center space-x-2 px-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">
                {t("confirmation.progress.paymentComplete")}
              </span>
            </div>

            <div className="w-16 h-0.5 bg-green-500 hidden sm:block"></div>

            <div className="flex items-center space-x-2 px-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">
                {t("confirmation.progress.confirmed")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("confirmation.title")} 🎉
          </h1>
          <p className="text-gray-600">{t("confirmation.subtitle")}</p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-200">
          <div className={`px-6 py-4 ${
            bookingDetails?.status === "cancelled" || bookingDetails?.paymentStatus === "failed" 
              ? "bg-gradient-to-r from-red-600 to-orange-600" 
              : "bg-gradient-to-r from-blue-600 to-purple-600"
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <h2 className="text-xl font-bold text-white text-center sm:text-left">
                {bookingDetails.event.title}
              </h2>
              {bookingDetails?.status === "cancelled" ? (
                <span className="bg-red-400 text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  {t("confirmation.status.cancelled")}
                </span>
              ) : bookingDetails?.paymentStatus === "failed" ? (
                <span className="bg-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  {t("confirmation.status.paymentFailed")}
                </span>
              ) : (
                <span className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  {t("confirmation.status.confirmed")}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-start text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    {formatEventDate(bookingDetails.event.date)}{" "}
                    {t("confirmation.at")} {bookingDetails.event.time}
                  </span>
                </div>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>
                    {bookingDetails.event.location.venue},{" "}
                    {bookingDetails.event.location.city}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t("confirmation.ticketInfo")}
                  </h4>
                  <div className="space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">
                        {t("confirmation.ticketType")}:
                      </span>{" "}
                      {bookingDetails.ticket.type}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("confirmation.quantity")}:
                      </span>{" "}
                      {bookingDetails.ticket.quantity}{" "}
                      {bookingDetails.ticket.quantity === 1
                        ? t("confirmation.ticketText")
                        : t("confirmation.ticketsText")}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("confirmation.totalPrice")}:
                      </span>
                      <span className="font-bold text-blue-600 ml-1">
                        {bookingDetails.ticket.price}{" "}
                        {bookingDetails.ticket.currency}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {t("confirmation.bookingDetails")}
                  </h4>
                  <div className="space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">
                        {t("confirmation.customer")}:
                      </span>{" "}
                      {bookingDetails.customer.name}
                    </p>
                    <p>
                      <span className="font-medium">
                        {t("confirmation.bookingCode")}:
                      </span>{" "}
                      {bookingDetails.customer.bookingCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col items-center">
                {loading ? (
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center mb-4 relative">
                    <Loader className="h-12 w-12 text-blue-500 animate-spin" />
                    <span className="text-xs text-gray-500 mt-2">
                      {t("confirmation.loadingQR")}
                    </span>
                  </div>
                ) : bookingDetails?.status === "cancelled" ? (
                  <div className="w-48 h-48 bg-red-50 rounded-xl flex items-center justify-center mb-4 relative">
                    <div className="text-center p-4">
                      <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
                      <p className="text-red-700 font-medium">
                        {t("confirmation.ticketCancelled")}
                      </p>
                      <p className="text-sm text-red-600 mt-2">
                        {t("confirmation.ticketCancelledMessage")}
                      </p>
                    </div>
                  </div>
                ) : bookingDetails?.paymentStatus === "failed" ? (
                  <div className="w-48 h-48 bg-orange-50 rounded-xl flex items-center justify-center mb-4 relative">
                    <div className="text-center p-4">
                      <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-2" />
                      <p className="text-orange-700 font-medium">
                        {t("confirmation.paymentFailed")}
                      </p>
                      <p className="text-sm text-orange-600 mt-2">
                        {t("confirmation.paymentFailedMessage")}
                      </p>
                    </div>
                  </div>
                ) : bookingDetails?.qrCode ? (
                  <div className="w-48 h-48 mb-4">
                    <img
                      src={bookingDetails.qrCode}
                      alt={t("confirmation.qrCodeAlt")}
                      className="w-full h-full rounded-xl border-2 border-blue-200 p-2"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center mb-4 relative">
                    <QrCode className="h-16 w-16 text-gray-400" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 border-2 border-gray-300 rounded mb-2"></div>
                        <span className="text-xs text-gray-500">
                          {t("confirmation.qrCode")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {bookingDetails?.status !== "cancelled" && bookingDetails?.paymentStatus !== "failed" && (
                  <p className="text-sm text-gray-600 text-center">
                    {t("confirmation.qrInstructions")}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {bookingDetails?.status !== "cancelled" && bookingDetails?.paymentStatus !== "failed" ? (
                <>
                  <button 
                    onClick={() => handleDownloadTicket(bookingDetails?.bookingId || bookingDetails?.bookingCode)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    {t("confirmation.downloadTicket")}
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium">
                    <Share2 className="h-5 w-5 mr-2" />
                    {t("confirmation.share")}
                  </button>
                </>
              ) : bookingDetails?.paymentStatus === "failed" ? (
                <button 
                  onClick={() => navigate(`/payment?retry=true&bookingCode=${bookingDetails?.bookingCode}`)}
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center font-medium"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t("confirmation.retryPayment")}
                </button>
              ) : (
                <button 
                  onClick={handleBackToEvents}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  {t("confirmation.browseEvents")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* حالة الخطأ */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              {t("confirmation.retry")}
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoToTickets}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            <User className="h-5 w-5 mr-2" />
            {t("confirmation.goToTickets")}
          </button>
          <button
            onClick={handleBackToEvents}
            className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center font-medium shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t("confirmation.backToEvents")}
          </button>
        </div>

        {/* Reminders */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4 text-center">
            {t("confirmation.importantReminders")}
          </h3>
          <div className="space-y-2 text-sm text-blue-800 text-center">
            {t("confirmation.reminders", { returnObjects: true }).map(
              (reminder, index) => (
                <p key={index}>• {reminder}</p>
              )
            )}
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">{t("confirmation.needHelp")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@tazkarti.com"
              className="text-blue-600 hover:underline font-medium flex items-center justify-center"
            >
              <Mail className="h-4 w-4 mr-1" />
              support@tazkarti.com
            </a>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <a
              href="tel:+1(234)567-8900"
              className="text-blue-600 hover:underline font-medium flex items-center justify-center"
            >
              <Phone className="h-4 w-4 mr-1" />
              +1 (234) 567-8900
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
