import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Shield,
  Ticket,
  Info
} from 'lucide-react';

const Booking = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Validation patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^01[0-9]{9}$/; // Egyptian phone format
  const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{2,50}$/; // Supports Arabic and English names

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Get event and ticket data from navigation state
  const eventData = location.state?.event || {
    _id: id,
    title: t('booking.defaultEventTitle'),
    startDate: "TBD",
    location: { venue: "TBD", city: "TBD" },
    images: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&h=120&fit=crop"]
  };

  const selectedTicketData = eventData.selectedTicket || null;
  const quantity = eventData.quantity || 1;
  const subtotal = eventData.subtotal || 0;
  const serviceFee = eventData.serviceFee || 5;
  const total = eventData.total || 0;

  const getTicketDisplayName = () => {
    return selectedTicketData ? selectedTicketData.type : t('booking.noTicketSelected');
  };

  const getTicketPrice = () => {
    return selectedTicketData ? selectedTicketData.price : 0;
  };

  const getTicketCurrency = () => {
    return selectedTicketData ? selectedTicketData.currency : 'EGP';
  };

  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'fullName':
        if (!value.trim()) {
          error = t('booking.errors.fullNameRequired');
        } else if (value.trim().length < 2) {
          error = t('booking.errors.fullNameMinLength');
        } else if (value.trim().length > 50) {
          error = t('booking.errors.fullNameMaxLength');
        } else if (!nameRegex.test(value.trim())) {
          error = t('booking.errors.fullNameInvalid');
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = t('booking.errors.emailRequired');
        } else if (!emailRegex.test(value)) {
          error = t('booking.errors.emailInvalid');
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = t('booking.errors.phoneRequired');
        } else if (!phoneRegex.test(value)) {
          error = t('booking.errors.phoneInvalid');
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    return error === '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setTimeout(() => validateField(field, value), 300);
  };

  const validateAllFields = () => {
    const fullNameValid = validateField('fullName', formData.fullName);
    const emailValid = validateField('email', formData.email);
    const phoneValid = validateField('phone', formData.phone);
    
    return fullNameValid && emailValid && phoneValid;
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleConfirmBooking = () => {
    if (!validateAllFields()) {
      alert(t('booking.fixErrorsAlert'));
      return;
    }

    navigate('/payment', {
      state: {
        eventData: eventData,
        bookingData: {
          selectedTicket: selectedTicketData,
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
    return formData.fullName && formData.email && formData.phone && 
           !fieldErrors.fullName && !fieldErrors.email && !fieldErrors.phone;
  };

  const formatEventDate = (dateString) => {
    if (dateString === "TBD") return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString(navigator.language, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
            {t('booking.backButton')}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('booking.pageTitle')}</h1>
          <p className="text-gray-600">{t('booking.pageSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details and Ticket Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('booking.eventSummary')}</h2>
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
                      <span>{eventData.time || t('booking.defaultTime')}</span>
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('booking.yourTickets')}</h2>

              {selectedTicketData ? (
                <div className="mb-6">
                  <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <Ticket className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-lg">{getTicketDisplayName()}</h4>
                      </div>
                      <span className="font-bold text-lg text-blue-600">
                        {getTicketPrice()} {getTicketCurrency()}
                      </span>
                    </div>
                    {selectedTicketData.description && (
                      <p className="text-sm text-gray-600 mb-2">{selectedTicketData.description}</p>
                    )}
                    {selectedTicketData.features && selectedTicketData.features.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{t('booking.features')}:</p>
                        <ul className="list-disc list-inside pl-4">
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
                  {t('booking.noTicketMessage')}
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-medium mb-3">{t('booking.quantity')}</h3>
                <div className="flex items-center justify-center">
                  <span className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded-lg">
                    {quantity} {t('booking.ticket', { count: quantity })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  {t('booking.quantityNote')}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">{t('booking.yourInformation')}</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.fullName')} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      onBlur={(e) => validateField('fullName', e.target.value)}
                      placeholder={t('booking.fullNamePlaceholder')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        fieldErrors.fullName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.fullName && !fieldErrors.fullName 
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.email')} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={(e) => validateField('email', e.target.value)}
                      placeholder={t('booking.emailPlaceholder')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        fieldErrors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.email && !fieldErrors.email 
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('booking.phone')} *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      onBlur={(e) => validateField('phone', e.target.value)}
                      placeholder={t('booking.phonePlaceholder')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all ${
                        fieldErrors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.phone && !fieldErrors.phone 
                            ? 'border-green-500 focus:ring-green-500'
                            : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-4">{t('booking.orderSummary')}</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>{getTicketDisplayName()} × {quantity}</span>
                  <span>{subtotal} {getTicketCurrency()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('booking.serviceFee')}</span>
                  <span>{serviceFee} {getTicketCurrency()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{t('booking.total')}</span>
                    <span className="text-orange-500">{total} {getTicketCurrency()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">{t('booking.secureBooking')}</h3>
                    <p className="text-sm text-blue-700">
                      {t('booking.securityMessage')}
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
                {t('booking.continueToPayment')}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                {t('booking.termsAgreement')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;