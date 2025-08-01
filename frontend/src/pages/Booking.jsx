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
  const [selectedTicket, setSelectedTicket] = useState('regular');
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const navigate = useNavigate();
  const { id } = useParams(); // ✅ للحصول على event ID من URL
  const location = useLocation(); // ✅ للحصول على event data من state

  // ✅ الحصول على بيانات الـ event المرسلة من Home page
  const eventData = location.state?.eventData || {
    id: id,
    title: "Default Event",
    date: "TBD",
    venue: "TBD",
    price: 0,
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop"
  };

  // ✅ تحديث ticket types بناءً على سعر الـ event
  const ticketTypes = {
    regular: { 
      name: 'Regular', 
      description: 'Standard seating', 
      price: eventData.price || 75 
    },
    vip: { 
      name: 'VIP', 
      description: 'Premium seating with complimentary drinks', 
      price: Math.round((eventData.price || 75) * 1.5) 
    },
    table: { 
      name: 'Table for 4', 
      description: 'Reserved table with bottle service', 
      price: Math.round((eventData.price || 75) * 4) 
    }
  };

  const serviceFee = 4;
  const subtotal = ticketTypes[selectedTicket].price * quantity;
  const total = subtotal + serviceFee;

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

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
    // ✅ تمرير بيانات أكثر للـ payment page
    navigate('/payment', {
      state: {
        eventData: eventData,
        bookingData: {
          selectedTicket: selectedTicket,
          quantity: quantity,
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
                  src={eventData.image}
                  alt={eventData.title}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{eventData.title}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>{formatEventDate(eventData.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>8:00 PM - 11:00 PM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{eventData.venue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Select Your Tickets</h2>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Ticket Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(ticketTypes).map(([key, ticket]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedTicket(key)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTicket === key
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <h4 className="font-semibold">{ticket.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                      <p className="font-bold text-lg text-blue-600">${ticket.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 rounded-full border hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 rounded-full border hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
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
                  <span>{ticketTypes[selectedTicket].name} × {quantity}</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Service Fee</span>
                  <span>${serviceFee}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-orange-500">${total}</span>
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