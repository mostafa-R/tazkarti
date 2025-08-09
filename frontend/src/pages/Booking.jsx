import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Minus,
  Plus,
  User,
  Mail,
  Phone,
  Shield
} from 'lucide-react';

const Booking = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const navigate = useNavigate();
  const { id } = useParams(); // Event ID from URL
  const location = useLocation(); // Event data from EventDetails page

  // NEW: Get real event and ticket data from EventDetails
  const eventData = location.state?.event || {
    _id: id,
    title: "Default Event",
    startDate: "TBD",
    location: { venue: "TBD", city: "TBD" },
    images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop"]
  };

  // NEW: Get real selected ticket data from EventDetails
  const selectedTicketData = eventData.selectedTicket || null;
  const quantity = eventData.quantity || 1;
  const subtotal = eventData.subtotal || 0;
  const serviceFee = eventData.serviceFee || 5;
  const total = eventData.total || 0;

  // Helper functions for displaying real ticket data
  const getTicketDisplayName = () => {
    return selectedTicketData ? selectedTicketData.type : 'No Ticket Selected';
  };

  const getTicketPrice = () => {
    return selectedTicketData ? selectedTicketData.price : 0;
  };

  const getTicketCurrency = () => {
    return selectedTicketData ? selectedTicketData.currency : 'EGP';
  };

  // Remove quantity change handler since quantity is now fixed from EventDetails
  // const handleQuantityChange = (change) => {
  //   const newQuantity = quantity + change;
  //   if (newQuantity >= 1) {
  //     setQuantity(newQuantity);
  //   }
  // };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ إضافة Back button functionality
  const handleGoBack = () => {
    navigate('/home');
  };

  const handleConfirmBooking = () => {
    // NEW: Pass real ticket data to payment page
    navigate('/payment', {
      state: {
        eventData: eventData,
        bookingData: {
          selectedTicket: selectedTicketData, // Real ticket object
          quantity: quantity,
          subtotal: subtotal,
          serviceFee: serviceFee,
          total: total,
          customerInfo: formData
        }
      }
    });
  };

  const isFormValid = () => {
    return formData.fullName && formData.email && formData.phone;
  };

  // ✅ Format date for better display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Secure your tickets in just a few steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details and Ticket Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Summary */}
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Event Summary</h2>
              <div className="flex space-x-4">
                <img
                  src={eventData.images ? eventData.images[0] : eventData.image}
                  alt={eventData.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{eventData.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>{formatEventDate(eventData.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{eventData.time || '8:00 PM - 11:00 PM'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{eventData.location?.venue || eventData.venue}, {eventData.location?.city || ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Ticket Display */}
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Your Selected Tickets</h2>

              {selectedTicketData ? (
                <div className="mb-6">
                  <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{getTicketDisplayName()}</h4>
                      <span className="font-bold text-lg text-blue-600">
                        {getTicketPrice()} {getTicketCurrency()}
                      </span>
                    </div>
                    {selectedTicketData.description && (
                      <p className="text-sm text-gray-600 mb-2">{selectedTicketData.description}</p>
                    )}
                    {selectedTicketData.features && selectedTicketData.features.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Features:</p>
                        <ul className="list-disc list-inside">
                          {selectedTicketData.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 rounded-xl border-2 border-gray-200 text-center text-gray-500">
                  No ticket selected. Please go back and select a ticket.
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-medium mb-3">Quantity</h3>
                <div className="flex items-center justify-center">
                  <span className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded-lg">
                    {quantity} ticket{quantity > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Quantity was selected on the previous page
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Your Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>{getTicketDisplayName()} × {quantity}</span>
                  <span>{subtotal} {getTicketCurrency()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service Fee</span>
                  <span>{serviceFee} {getTicketCurrency()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">{total} {getTicketCurrency()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Secure Booking</h3>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure. Free cancellation up to 24 hours before the event.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={!isFormValid()}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  isFormValid()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Payment
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By confirming, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;