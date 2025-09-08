import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "../services/api";

import {
  Calendar,
  ChevronDown,
  Film,
  GraduationCap,
  Loader2,
  MapPin,
  MoreHorizontal,
  Music,
  Search,
  Theater,
  Trophy,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Footer from "../Components/footer.jsx";
import EventService from "../services/eventService";

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // تحسين Categories مع إضافة أيقونات حقيقية
  const categories = useMemo(
    () => [
      {
        name: t("category.sports"),
        icon: Trophy,
        color: "bg-red-100 text-red-600 hover:bg-red-200",
        key: "sports",
      },
      {
        name: t("category.music"),
        icon: Music,
        color: "bg-purple-100 text-purple-600 hover:bg-purple-200",
        key: "music",
      },
      {
        name: t("category.theater"),
        icon: Theater,
        color: "bg-green-100 text-green-600 hover:bg-green-200",
        key: "theater",
      },
      {
        name: t("category.education"),
        icon: GraduationCap,
        color: "bg-blue-100 text-blue-600 hover:bg-blue-200",
        key: "education",
      },
      {
        name: t("category.movies"),
        icon: Film,
        color: "bg-orange-100 text-orange-600 hover:bg-orange-200",
        key: "movies",
      },
      {
        name: t("category.others"),
        icon: MoreHorizontal,
        color: "bg-pink-100 text-pink-600 hover:bg-pink-200",
        key: "others",
      },
    ],
    [t]
  );

  const handleEventClick = (event) => {
    navigate(`/event/${event._id}`, { state: { event } });
  };
  // Define fetchUpcomingEvents with useCallback
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await eventsAPI.getUpcomingEvents();

      // Handle both old format (direct array) and new format (with pagination)
      if (response.data.events) {
        setUpcomingEvents(response.data.events);
      } else if (Array.isArray(response.data)) {
        setUpcomingEvents(response.data);
      } else {
        setUpcomingEvents([]);
      }
    } catch (err) {
      setError("Failed to load upcoming events");
      console.error("Error fetching upcoming events:", err);
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch events when component mounts
  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  // Functions للتعامل مع الأحداث
  const handleBookNow = useCallback(
    (event) => {
      navigate(`/event/${event.id}`, {
        state: {
          eventData: event,
        },
      });
    },
    [navigate]
  );

  const handleCategoryClick = useCallback(
    (category) => {
      navigate("/events", {
        state: {
          selectedCategory: category.key || category.name,
        },
      });
    },
    [navigate]
  );

  const handleSearchEvents = useCallback(() => {
    if (searchQuery.trim()) {
      navigate("/events", {
        state: {
          searchQuery: searchQuery.trim(),
          selectedCategory: selectedCategory || undefined,
        },
      });
    } else {
      navigate("/events");
    }
  }, [navigate, searchQuery, selectedCategory]);

  const handleSearchKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearchEvents();
      }
    },
    [handleSearchEvents]
  );

  // تحديد اتجاه النص
  const isRTL = i18n.language === "ar";

  return (
    <div
      className={`min-h-screen bg-gray-50 ${
        isRTL ? "font-arabic" : "font-sans"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&h=800&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-40 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
              {t("hero.description")}
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${
                    isRTL ? "right-4" : "left-4"
                  }`}
                />
                <input
                  type="text"
                  placeholder={t("mainSearch.placeholder")}
                  className={`w-full py-4 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 rounded-xl bg-gray-50 transition-all duration-300 ${
                    isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                  }`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                />
              </div>

              <div className="relative min-w-[200px]">
                <select
                  className={`appearance-none bg-gray-50 border-0 py-4 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 cursor-pointer w-full rounded-xl transition-all duration-300 ${
                    isRTL ? "pr-10 pl-4" : "pr-10 pl-4"
                  }`}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">{t("mainSearch.allCategories")}</option>
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none ${
                    isRTL ? "left-3" : "right-3"
                  }`}
                />
              </div>

              <button
                onClick={handleSearchEvents}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {t("mainSearch.button")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("categories.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("categories.description")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.key}
                className="text-center group cursor-pointer transform transition-all duration-500 hover:scale-110"
                onClick={() => handleCategoryClick(category)}
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${category.color} flex items-center justify-center transition-all duration-300 shadow-lg group-hover:shadow-xl`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 text-sm">
                  {category.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("events.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("events.description")}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <span className="text-lg text-gray-600">
                  {t("events.loading")}
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-lg mx-auto">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  {t("error.title")}
                </h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={fetchUpcomingEvents}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                >
                  {t("error.tryAgain")}
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            Array.isArray(upcomingEvents) &&
            upcomingEvents.length === 0 && (
              <div className="text-center py-20 ">
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-12 max-w-lg mx-auto">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t("events.emptyTitle")}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t("events.emptyDescription")}
                  </p>
                  <button
                    onClick={() => navigate("/events")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
                  >
                    {t("events.browseAll")}
                  </button>
                </div>
              </div>
            )}

          {/* Events Grid */}
          {!loading &&
            !error &&
            Array.isArray(upcomingEvents) &&
            upcomingEvents.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.slice(0, 6).map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 group transform hover:scale-105 border border-gray-100 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      {/* Event Image */}
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={EventService.getEventImage(event)}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-30 via-transparent to-transparent group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 left-4 bg-blue-600 bg-opacity-95 text-white px-3 py-1 rounded-full text-sm font-bold capitalize shadow-lg">
                          {event.category}
                        </div>
                        {event.status && (
                          <div className="absolute top-4 right-4 bg-green-500 bg-opacity-95 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            {event.status}
                          </div>
                        )}
                      </div>
                      {/* Event Content */}
                      <div className="p-6">
                        <h3
                          className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 min-h-[3.5rem] overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {event.title}
                        </h3>
                        {/* Event Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                            <span className="font-medium">
                              {EventService.formatEventDate(event.startDate)}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                            <span className="font-medium truncate">
                              {event.location?.venue || t("events.venueTBA")}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                            <span className="font-medium">
                              {event.currentAttendees || 0}/{event.maxAttendees}{" "}
                              {t("events.attendees")}
                            </span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: `${Math.min(
                                  ((event.currentAttendees || 0) /
                                    event.maxAttendees) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        {/* Book Now Button */}
                        <button
                          onClick={() => handleBookNow(event)}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          {t("events.bookNow")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* View All Events Button */}
                {Array.isArray(upcomingEvents) && upcomingEvents.length > 6 && (
                  <div className="text-center mt-12">
                    <button
                      onClick={() => navigate("/events")}
                      className="bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      {t("events.viewAll")} ({upcomingEvents.length})
                    </button>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
      {/* How It Works */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("howItWorks.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("howItWorks.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:shadow-blue-500 group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-200">
                {t("howItWorks.discoverTitle")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("howItWorks.discoverDescription")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:shadow-purple-500 group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-200">
                {t("howItWorks.chooseTitle")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("howItWorks.chooseDescription")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:shadow-green-500 group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-200">
                {t("howItWorks.confirmTitle")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("howItWorks.confirmDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

  
    </div>
  );
};

export default HomePage;
