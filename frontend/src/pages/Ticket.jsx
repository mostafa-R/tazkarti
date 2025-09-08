import {
  Calendar,
  Download,
  Eye,
  HelpCircle,
  Loader,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { bookingAPI } from "../services/api";

const MyTicketsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // التحقق من تسجيل الدخول
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-tickets' } });
      return;
    }

    const fetchUserTickets = async () => {
      try {
        setLoading(true);
        const response = await bookingAPI.getMyBookings();
        
        if (response.data && response.data.success) {
          // تحويل البيانات من الباك إند إلى تنسيق مناسب للعرض
          const formattedTickets = response.data.bookings.map(booking => ({
            id: booking._id,
            bookingCode: booking.bookingCode,
            status: getTicketStatus(booking),
            event: {
              id: booking.event?._id,
              title: booking.event?.title || 'غير متوفر',
              date: booking.event?.startDate || new Date(),
              location: booking.event?.location?.venue || booking.event?.location || 'غير متوفر',
              image: booking.event?.images?.[0] || '/placeholder-event.jpg',
            },
            ticket: {
              type: booking.ticket?.type || 'تذكرة قياسية',
              quantity: booking.quantity || 1,
              totalPrice: booking.totalPrice || 0,
              currency: booking.ticket?.currency || 'EGP',
              bookingCode: booking.bookingCode,
            },
            paymentStatus: booking.paymentStatus,
            qrCode: booking.qrCode,
            createdAt: booking.createdAt,
          }));
          
          setTickets(formattedTickets);
        } else {
          setError("فشل في جلب التذاكر");
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError("حدث خطأ أثناء جلب التذاكر");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, [isAuthenticated, navigate]);

  // تحديد حالة التذكرة بناءً على بيانات الحجز
  const getTicketStatus = (booking) => {
    if (booking.status === 'cancelled') return 'Cancelled';
    if (booking.paymentStatus === 'failed') return 'Cancelled';
    
    // التحقق مما إذا كان الحدث قد انتهى
    const eventDate = booking.event?.endDate || booking.event?.startDate;
    if (eventDate && new Date(eventDate) < new Date()) {
      return 'Past';
    }
    
    return 'Upcoming';
  };


  // تحديث خيارات التصفية بناءً على البيانات الفعلية
  const filterOptions = [
    { label: "All", count: tickets.length },
    {
      label: "Upcoming",
      count: tickets.filter((t) => t.status === "Upcoming").length,
    },
    { 
      label: "Past", 
      count: tickets.filter((t) => t.status === "Past").length 
    },
    { 
      label: "Cancelled", 
      count: tickets.filter((t) => t.status === "Cancelled").length 
    },
  ];

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "All" || ticket.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      Upcoming: "bg-green-100 text-green-800",
      Past: "bg-gray-100 text-gray-800",
      Cancelled: "bg-red-100 text-red-800",
    };

    return statusStyles[status] || "bg-gray-100 text-gray-800";
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(navigator.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("myTickets.title", "تذاكري")}
          </h1>
          <p className="text-gray-600">{t("myTickets.subtitle", "عرض وإدارة تذاكر الفعاليات الخاصة بك")}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t("myTickets.searchPlaceholder", "بحث عن تذاكر...")}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 w-full lg:w-auto">
              {filterOptions.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setActiveFilter(filter.label)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeFilter === filter.label
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t(`myTickets.filters.${filter.label.toLowerCase()}`, filter.label)} (
                  {filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">جاري تحميل التذاكر...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-red-800 mb-2">
              حدث خطأ
            </h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Tickets List */}
        {!loading && !error && (
          <div className="space-y-6">
            {filteredTickets.map((ticketData) => (
              <div
                key={ticketData.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Event Image */}
                  <div className="md:w-64 h-48 md:h-auto relative">
                    <img
                      src={ticketData.event.image}
                      alt={ticketData.event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-event.jpg';
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          ticketData.status
                        )}`}
                      >
                        <span className="inline-block w-2 h-2 bg-current rounded-full mr-1"></span>
                        {t(`myTickets.status.${ticketData.status.toLowerCase()}`, ticketData.status)}
                      </span>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {ticketData.event.title}
                        </h3>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            <span className="text-sm">
                              {formatEventDate(ticketData.event.date)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-red-500" />
                            <span className="text-sm">
                              {ticketData.event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Information */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">
                          {t("myTickets.ticketType", "نوع التذكرة")}
                        </span>
                        <span className="font-medium text-gray-900">
                          {ticketData.ticket.type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">
                          {t("myTickets.quantity", "العدد")}
                        </span>
                        <span className="font-medium text-gray-900">
                          {ticketData.ticket.quantity}{" "}
                          {ticketData.ticket.quantity === 1
                            ? t("myTickets.ticketText", "تذكرة")
                            : t("myTickets.ticketsText", "تذاكر")}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">
                          {t("myTickets.totalPrice", "السعر الإجمالي")}
                        </span>
                        <span className="font-medium text-blue-600">
                          {ticketData.ticket.totalPrice}{" "}
                          {ticketData.ticket.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">
                          {t("myTickets.bookingCode", "رمز الحجز")}
                        </span>
                        <span className="font-medium text-gray-900">
                          {ticketData.bookingCode}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate(`/ticket?id=${ticketData.bookingCode}`)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t("myTickets.viewTicket", "عرض التذكرة")}
                      </button>
                      {ticketData.status !== 'Cancelled' && ticketData.paymentStatus !== 'failed' && (
                        <button 
                          onClick={() => navigate(`/ticket?id=${ticketData.bookingCode}&download=true`)}
                          className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t("myTickets.downloadQR", "تنزيل QR")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredTickets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("myTickets.noTickets.title", "لا توجد تذاكر")}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? t("myTickets.noTickets.searchMessage", "لم يتم العثور على تذاكر مطابقة لبحثك")
                : t("myTickets.noTickets.defaultMessage", "لم تقم بحجز أي تذاكر بعد")}
            </p>
            <button 
              onClick={() => navigate('/events')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              استعرض الفعاليات
            </button>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            <HelpCircle className="inline-block mr-2" />
            {t("myTickets.needHelp.title")}
          </h3>
          <p className="text-blue-700 mb-4">
            {t("myTickets.needHelp.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@tazkarti.com"
              className="text-blue-600 hover:underline font-medium"
            >
              support@tazkarti.com
            </a>
            <span className="text-blue-700 hidden sm:inline">|</span>
            <a
              href="tel:+1(234)567-8900"
              className="text-blue-600 hover:underline font-medium"
            >
              +1 (234) 567-8900
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTicketsPage;
