import {
  Calendar,
  Download,
  Eye,
  HelpCircle,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const MyTicketsPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const tickets = [
    {
      id: 1,
      event: {
        title: t("myTickets.events.jazzNight"),
        date: "2024-03-15T20:00:00",
        location: t("myTickets.locations.blueNote"),
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      },
      ticket: {
        type: t("myTickets.ticketTypes.vip"),
        quantity: 2,
        totalPrice: 180,
        currency: "EGP",
        bookingCode: "TZK-JN-001234",
      },
      status: "Upcoming",
    },
    {
      id: 2,
      event: {
        title: t("myTickets.events.rockFestival"),
        date: "2024-04-22T18:00:00",
        location: t("myTickets.locations.centralPark"),
        image:
          "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=200&fit=crop",
      },
      ticket: {
        type: t("myTickets.ticketTypes.regular"),
        quantity: 4,
        totalPrice: 320,
        currency: "EGP",
        bookingCode: "TZK-RF-005678",
      },
      status: "Upcoming",
    },
    {
      id: 3,
      event: {
        title: t("myTickets.events.electronicFestival"),
        date: "2024-05-05T22:00:00",
        location: t("myTickets.locations.warehouse"),
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop",
      },
      ticket: {
        type: t("myTickets.ticketTypes.vip"),
        quantity: 1,
        totalPrice: 150,
        currency: "EGP",
        bookingCode: "TZK-EMF-445566",
      },
      status: "Upcoming",
    },
  ];

  const filterOptions = [
    { label: "All", count: tickets.length },
    {
      label: "Upcoming",
      count: tickets.filter((t) => t.status === "Upcoming").length,
    },
    { label: "Past", count: 0 },
    { label: "Cancelled", count: 0 },
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
            {t("myTickets.title")}
          </h1>
          <p className="text-gray-600">{t("myTickets.subtitle")}</p>
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
                placeholder={t("myTickets.searchPlaceholder")}
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
                  {t(`myTickets.filters.${filter.label.toLowerCase()}`)} (
                  {filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
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
                  />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        ticketData.status
                      )}`}
                    >
                      <span className="inline-block w-2 h-2 bg-current rounded-full mr-1"></span>
                      {t(`myTickets.status.${ticketData.status.toLowerCase()}`)}
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
                        {t("myTickets.ticketType")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {ticketData.ticket.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">
                        {t("myTickets.quantity")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {ticketData.ticket.quantity}{" "}
                        {ticketData.ticket.quantity === 1
                          ? t("myTickets.ticketText")
                          : t("myTickets.ticketsText")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">
                        {t("myTickets.totalPrice")}
                      </span>
                      <span className="font-medium text-blue-600">
                        {ticketData.ticket.totalPrice}{" "}
                        {ticketData.ticket.currency}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">
                        {t("myTickets.bookingCode")}
                      </span>
                      <span className="font-medium text-gray-900">
                        {ticketData.ticket.bookingCode}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate(`/my-tickets/${ticketData.id}`)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("myTickets.viewTicket")}
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      {t("myTickets.downloadQR")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("myTickets.noTickets.title")}
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? t("myTickets.noTickets.searchMessage")
                : t("myTickets.noTickets.defaultMessage")}
            </p>
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
