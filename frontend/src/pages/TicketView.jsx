import { AlertCircle, ArrowLeft, Calendar, CheckCircle, Download, Globe, Loader, MapPin, QrCode, Share2, User } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingAPI } from '../services/api';

const TicketView = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketId = searchParams.get('id');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showQRFullscreen, setShowQRFullscreen] = useState(false);
  const currentLanguage = i18n.language || 'ar';

  useEffect(() => {
    const fetchTicket = async () => {
      if (!ticketId) {
        setError(t('ticketView.errors.noTicketId', 'معرف التذكرة غير موجود'));
        setLoading(false);
        return;
      }

      try {
        const response = await bookingAPI.getTicketDetails(ticketId);
        if (response.data && response.data.success) {
          setTicket(response.data.data);
          
          // التحقق من وجود معلمة التنزيل في URL
          const urlParams = new URLSearchParams(window.location.search);
          const shouldDownload = urlParams.get('download') === 'true';
          
          if (shouldDownload && response.data.data) {
            // تنزيل التذكرة تلقائياً
            setTimeout(() => {
              handleDownload();
            }, 1000);
          }
        } else {
          setError(t('ticketView.errors.fetchFailed', 'فشل في جلب بيانات التذكرة'));
        }
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setError(t('ticketView.errors.general', 'حدث خطأ أثناء جلب بيانات التذكرة'));
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, t]);

  const handleDownload = useCallback(async () => {
    if (!ticket || !ticket.bookingCode) return;
    
    try {
      setLoading(true);
      const response = await bookingAPI.downloadTicket(ticket.bookingCode);
      
      // Create a download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticket.bookingCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      setSuccessMessage(t('ticketView.downloadSuccess', 'تم تنزيل التذكرة بنجاح'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      setError(t('ticketView.errors.downloadFailed', 'فشل في تنزيل التذكرة'));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  }, [ticket, t]);

  const formatDate = (dateString) => {
    if (!dateString) return t('confirmation.dateNotSpecified', 'تاريخ غير محدد');
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // تبديل اللغة
  const toggleLanguage = useCallback(() => {
    const newLang = currentLanguage === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  }, [currentLanguage, i18n]);
  
  // تبديل عرض QR بملء الشاشة
  const toggleQRFullscreen = useCallback(() => {
    setShowQRFullscreen(prev => !prev);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t('ticketView.loading', 'جاري تحميل بيانات التذكرة...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="absolute top-4 right-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label={t('language', 'اللغة')}
            >
              <Globe className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('ticketView.error', 'خطأ')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('eventDetails.backToEvents', 'العودة للفعاليات')}
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="absolute top-4 right-4">
            <button 
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label={t('language', 'اللغة')}
            >
              <Globe className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('ticketView.notFound', 'التذكرة غير موجودة')}</h2>
          <p className="text-gray-600 mb-4">{t('ticketView.notFoundMessage', 'لم نتمكن من العثور على التذكرة المطلوبة')}</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('eventDetails.backToEvents', 'العودة للفعاليات')}
          </button>
        </div>
      </div>
    );
  }

  // تحديد صحة التذكرة بناءً على الحالة
  const isTicketValid = (ticket.status === 'confirmed' || ticket.status === 'active') && 
                       (ticket.paymentStatus === 'completed' || ticket.paymentStatus === 'success');

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Language Toggle */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleLanguage}
            className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-md"
            aria-label={t('language', 'اللغة')}
          >
            <Globe className="h-5 w-5 text-blue-600" />
          </button>
        </div>
        
        {/* Header for QR Code Scanning */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('ticketView.title', 'تذكرة الفعالية')}</h1>
          <p className="text-gray-600">{t('ticketView.subtitle', 'تم مسح رمز QR بنجاح - عرض تفاصيل التذكرة')}</p>
        </div>
        
        {/* Ticket Status Banner */}
        {isTicketValid ? (
          <div className="bg-green-100 border border-green-200 rounded-lg p-4 flex items-center mb-6">
            <CheckCircle className={`h-6 w-6 text-green-500 ${currentLanguage === 'ar' ? 'ml-3' : 'mr-3'}`} />
            <div>
              <h3 className="font-bold text-green-800">{t('ticketView.validTicket', 'تذكرة صالحة')}</h3>
              <p className="text-green-700 text-sm">{t('ticketView.validMessage', 'تم تأكيد هذه التذكرة ويمكن استخدامها للدخول')}</p>
            </div>
          </div>
        ) : (
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 flex items-center mb-6">
            <AlertCircle className={`h-6 w-6 text-red-500 ${currentLanguage === 'ar' ? 'ml-3' : 'mr-3'}`} />
            <div>
              <h3 className="font-bold text-red-800">{t('ticketView.invalidTicket', 'تذكرة غير صالحة')}</h3>
              <p className="text-red-700 text-sm">
                {ticket.status === 'cancelled'
                  ? t('ticketView.cancelledMessage', 'تم إلغاء هذه التذكرة')
                  : ticket.paymentStatus === 'failed'
                  ? t('ticketView.paymentFailedMessage', 'فشلت عملية الدفع لهذه التذكرة')
                  : t('ticketView.pendingMessage', 'هذه التذكرة في انتظار التأكيد')}
              </p>
            </div>
          </div>
        )}

        {/* Ticket Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className={`px-6 py-4 ${
            isTicketValid 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
              : 'bg-gradient-to-r from-gray-700 to-gray-900'
          }`}>
            <h2 className="text-xl font-bold text-white">{ticket.event?.title || t('confirmation.defaultEventTitle', 'فعالية')}</h2>
          </div>

          <div className="p-6">
            {/* QR Code */}
            <div className="flex justify-center mb-6">
              {ticket.qrCode ? (
                <div 
                  className="w-64 h-64 p-2 border-2 border-blue-200 rounded-xl relative cursor-pointer hover:shadow-lg transition-all duration-300" 
                  onClick={toggleQRFullscreen}
                >
                  <img 
                    src={ticket.qrCode} 
                    alt={t('confirmation.qrCodeAlt', 'QR Code')} 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center rounded-xl transition-all duration-300">
                    <QrCode className="h-8 w-8 text-blue-500 opacity-0 hover:opacity-100" />
                  </div>
                  <div className="text-xs text-center mt-1 text-blue-500">
                    {t('ticketView.clickToEnlarge', 'انقر لتكبير الصورة')}
                  </div>
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-xl">
                  <p className="text-gray-500">{t('ticketView.noQRCode', 'QR Code غير متوفر')}</p>
                </div>
              )}
            </div>
            
            {/* QR Code Fullscreen Modal */}
            {showQRFullscreen && ticket.qrCode && (
              <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={toggleQRFullscreen}>
                <div className="bg-white p-4 rounded-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{t('ticketView.qrCodeFullscreen', 'رمز QR')}</h3>
                    <button 
                      onClick={toggleQRFullscreen}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <img 
                      src={ticket.qrCode} 
                      alt={t('confirmation.qrCodeAlt', 'QR Code')} 
                      className="w-full max-w-xs object-contain"
                    />
                  </div>
                  <p className="text-center mt-4 text-gray-600">
                    {t('ticketView.qrInstructions', 'قم بعرض هذا الرمز عند مدخل الفعالية')}
                  </p>
                </div>
              </div>
            )}

            {/* Booking Code */}
            <div className="bg-gray-100 rounded-lg py-3 px-4 text-center mb-6">
              <p className="text-sm text-gray-500 mb-1">{t('confirmation.bookingCode', 'رمز الحجز')}</p>
              <p className="text-xl font-mono font-bold">{ticket.bookingCode}</p>
            </div>

            {/* Event Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <Calendar className={`h-5 w-5 ${currentLanguage === 'ar' ? 'ml-3' : 'mr-3'} text-blue-500 mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="font-medium">{t('ticketView.dateAndTime', 'التاريخ والوقت')}</p>
                  <p className="text-gray-600">
                    {formatDate(ticket.event?.startDate || ticket.event?.date)}
                    {ticket.event?.time && ` ${t('confirmation.at', 'في')} ${ticket.event.time}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className={`h-5 w-5 ${currentLanguage === 'ar' ? 'ml-3' : 'mr-3'} text-red-500 mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="font-medium">{t('eventDetails.location', 'المكان')}</p>
                  <p className="text-gray-600">
                    {ticket.event?.location?.venue || ticket.event?.location || t('ticketView.notSpecified', 'غير محدد')}
                    {ticket.event?.location?.city && `, ${ticket.event.location.city}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className={`h-5 w-5 ${currentLanguage === 'ar' ? 'ml-3' : 'mr-3'} text-purple-500 mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="font-medium">{t('ticketView.attendeeName', 'اسم الحاضر')}</p>
                  <p className="text-gray-600">
                    {ticket.attendeeInfo?.name || ticket.customer?.name || t('ticketView.notSpecified', 'غير محدد')}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-medium mb-3">{t('ticketView.ticketDetails', 'تفاصيل التذكرة')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('confirmation.ticketType', 'نوع التذكرة')}</p>
                  <p className="font-medium">{ticket.ticket?.type || t('confirmation.defaultTicketType', 'قياسية')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('confirmation.quantity', 'العدد')}</p>
                  <p className="font-medium">
                    {ticket.quantity || 1} {ticket.quantity === 1 
                      ? t('confirmation.ticketText', 'تذكرة') 
                      : t('confirmation.ticketsText', 'تذاكر')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('confirmation.totalPrice', 'السعر الإجمالي')}</p>
                  <p className="font-medium text-blue-600">
                    {ticket.totalPrice} {ticket.ticket?.currency || 'EGP'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('ticketView.paymentStatus', 'حالة الدفع')}</p>
                  <p className={`font-medium ${
                    ticket.paymentStatus === 'completed' || ticket.paymentStatus === 'success' ? 'text-green-600' : 
                    ticket.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {ticket.paymentStatus === 'completed' || ticket.paymentStatus === 'success' 
                      ? t('ticketView.paymentCompleted', 'مكتمل') 
                      : ticket.paymentStatus === 'failed' 
                      ? t('ticketView.paymentFailed', 'فشل') 
                      : ticket.paymentStatus === 'pending' 
                      ? t('ticketView.paymentPending', 'قيد الانتظار') 
                      : t('ticketView.paymentCancelled', 'ملغي')}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isTicketValid && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl"
                >
                  <Download className={`h-5 w-5 ${currentLanguage === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('confirmation.downloadTicket', 'تنزيل التذكرة')}
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center font-medium">
                  <Share2 className={`h-5 w-5 ${currentLanguage === 'ar' ? 'ml-2' : 'mr-2'}`} />
                  {t('confirmation.share', 'مشاركة')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-6 text-center">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}
        
        {error && error !== t('ticketView.errors.noTicketId', 'معرف التذكرة غير موجود') && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Back Button */}
        <div className="flex justify-center space-x-4 rtl:space-x-reverse">
          <button
            onClick={() => navigate(-1)}
            className="bg-white text-blue-600 border-2 border-blue-600 py-2 px-6 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
          >
            <ArrowLeft className={`h-4 w-4 ${currentLanguage === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {t('ticketView.back', 'العودة')}
          </button>
          
          <button
            onClick={() => navigate('/my-tickets')}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('confirmation.goToTickets', 'الذهاب إلى تذاكري')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
