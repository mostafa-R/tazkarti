import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Download,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Share2,
  User,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

const BookingConfirmationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Get booking data from navigation state or use defaults
  const bookingDetails = location.state?.bookingData || {
    event: {
      title: t("confirmation.defaultEventTitle"),
      date: new Date().toLocaleDateString(),
      location: {
        venue: t("confirmation.defaultVenue"),
        city: t("confirmation.defaultCity"),
      },
      time: "8:00 PM",
    },
    ticket: {
      type: t("confirmation.defaultTicketType"),
      quantity: 1,
      price: 100,
      currency: "EGP",
    },
    customer: {
      name: t("confirmation.defaultCustomer"),
      bookingCode: "TZK-" + Math.floor(100000 + Math.random() * 900000),
    },
  };

  const handleGoToTickets = () => {
    navigate("/my-tickets");
  };

  const handleBackToEvents = () => {
    navigate("/events");
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <h2 className="text-xl font-bold text-white text-center sm:text-left">
                {bookingDetails.event.title}
              </h2>
              <span className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                {t("confirmation.status.confirmed")}
              </span>
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
                <p className="text-sm text-gray-600 text-center">
                  {t("confirmation.qrInstructions")}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl">
                <Download className="h-5 w-5 mr-2" />
                {t("confirmation.downloadTicket")}
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium">
                <Share2 className="h-5 w-5 mr-2" />
                {t("confirmation.share")}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoToTickets}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
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
