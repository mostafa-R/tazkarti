import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, CheckCircle, Download, Share2,
  QrCode, User, ArrowLeft
} from 'lucide-react';

const BookingConfirmationPage = () => {
  const navigate = useNavigate();

  const bookingDetails = {
    event: {
      title: "Jazz Night 2024",
      date: "Saturday, March 15, 2024 at 8:00 PM",
      location: "Blue Note Jazz Club, Downtown"
    },
    ticket: {
      type: "VIP",
      quantity: 2,
      price: 180
    },
    customer: {
      name: "Sarah Johnson",
      bookingCode: "TZK-2024-JN-001234"
    }
  };

  const handleGoToTickets = () => {
    navigate('/my-tickets');
  };

  const handleBackToEvents = () => {
    navigate('/events');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Indicators */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Event Selected</span>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Payment Complete</span>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">Confirmed</span>
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
            Your booking is confirmed! 🎉
          </h1>
          <p className="text-gray-600">
            Thank you for choosing Tazkarti. Your ticket details are below.
          </p>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{bookingDetails.event.title}</h2>
              <span className="bg-green-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                Confirmed
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Event Details */}
              <div>
                <div className="flex items-center text-gray-600 mb-3">
                  <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                  <span>{bookingDetails.event.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-red-500" />
                  <span>{bookingDetails.event.location}</span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="text-right md:text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Ticket Information</h4>
                    <div className="space-y-1 text-gray-600">
                      <p><span className="font-medium">Ticket Type:</span> {bookingDetails.ticket.type}</p>
                      <p><span className="font-medium">Quantity:</span> {bookingDetails.ticket.quantity} tickets</p>
                      <p><span className="font-medium">Total Price:</span> <span className="font-bold text-blue-600">${bookingDetails.ticket.price}</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                    <div className="space-y-1 text-gray-600">
                      <p><span className="font-medium">Customer:</span> {bookingDetails.customer.name}</p>
                      <p><span className="font-medium">Booking Code:</span> {bookingDetails.customer.bookingCode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="border-t pt-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center mb-4 relative">
                  <QrCode className="h-16 w-16 text-gray-400" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 border-2 border-gray-300 rounded mb-2"></div>
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Show this QR code at the venue entrance
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl">
                <Download className="h-5 w-5 mr-2" />
                Download Ticket
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium">
                <Share2 className="h-5 w-5 mr-2" />
                Share
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
            Go to My Tickets
          </button>
          <button
            onClick={handleBackToEvents}
            className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center font-medium shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </button>
        </div>

        {/* Reminders */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4 text-center">Important Reminders</h3>
          <div className="space-y-2 text-sm text-blue-800 text-center">
            <p>• Please arrive 30 minutes before the event starts</p>
            <p>• Bring a valid ID for verification</p>
            <p>• Screenshots of tickets are not accepted</p>
            <p>• Contact support if you need to make changes</p>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">Need help? Contact our support team at</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@tazkarti.com" className="text-blue-600 hover:underline font-medium">
              support@tazkarti.com
            </a>
            <span className="text-gray-700 hidden sm:inline">|</span>
            <a href="tel:+1(234)567-8900" className="text-blue-600 hover:underline font-medium">
              +1 (234) 567-8900
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
