import {
  Calendar,
  Filter,
  Grid,
  List,
  Loader,
  MapPin,
  Search,
  Tag,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import EventCard from "../Components/EventCard.jsx";
import { eventsAPI } from "../services/api.js";

const EventsPage = () => {
  const navigate = useNavigate();

  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for advanced search and filtering
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters state (from SearchPage)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
  });

  // Available categories (unified from both pages)
  const categories = [
    { value: "", label: t("search.allCategories") },
    { value: "technology", label: t("search.categories.technology") },
    { value: "business", label: t("search.categories.business") },
    { value: "entertainment", label: t("search.categories.entertainment") },
    { value: "sports", label: t("search.categories.sports") },
    { value: "education", label: t("search.categories.education") },
    { value: "health", label: t("search.categories.health") },
    { value: "music", label: t("eventsPage.categories.music") },
    { value: "theater", label: t("eventsPage.categories.theater") },
    { value: "movies", label: t("eventsPage.categories.movies") },
  ];

  // Main search function (from SearchPage - server-side filtering)
  const searchEvents = async (page = 1) => {
    try {
      setLoading(true);

      const searchParams = {
        ...filters,
        page,
        limit: 12,
      };

      // Remove empty filters
      Object.keys(searchParams).forEach((key) => {
        if (!searchParams[key]) {
          delete searchParams[key];
        }
      });

      const response = await eventsAPI.searchEvents(searchParams);

      if (response.data.events) {
        setEvents(response.data.events);
        setPagination(
          response.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalEvents: 0,
          }
        );
      } else {
        // Fallback for old API response format
        setEvents(response.data || []);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalEvents: response.data?.length || 0,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(t("eventsPage.noEvents"));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes (from SearchPage)
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.keys(newFilters).forEach((filterKey) => {
      if (newFilters[filterKey]) {
        newSearchParams.set(filterKey, newFilters[filterKey]);
      }
    });
    setSearchParams(newSearchParams);
  };

  // Handle search submit (from SearchPage)
  const handleSearch = (e) => {
    e.preventDefault();
    searchEvents(1);
  };

  // Handle pagination (from SearchPage)
  const handlePageChange = (newPage) => {
    searchEvents(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      location: "",
      startDate: "",
      endDate: "",
    });
    setSearchParams(new URLSearchParams());
    searchEvents(1);
  };

  // Event handlers (from original EventsPage)
  const handleEventClick = (event) => {
    navigate(`/event/${event._id}`, { state: { event } });
  };

  const handleBookNow = (event, e) => {
    e.stopPropagation();
    navigate(`/event/${event._id}`, { state: { event } });
  };

  // Initial load
  useEffect(() => {
    searchEvents(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format date for display (from SearchPage)
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(t("locale"), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Category badge color (from original EventsPage)
  const getCategoryBadgeColor = (category) => {
    const colors = {
      music: "bg-purple-100 text-purple-800",
      sports: "bg-red-100 text-red-800",
      theater: "bg-green-100 text-green-800",
      education: "bg-blue-100 text-blue-800",
      movies: "bg-yellow-100 text-yellow-800",
      technology: "bg-indigo-100 text-indigo-800",
      business: "bg-gray-100 text-gray-800",
      entertainment: "bg-pink-100 text-pink-800",
      health: "bg-green-100 text-green-800",
    };
    return colors[category?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("eventsPage.title")}
              </h1>
              <p className="text-gray-600">{t("eventsPage.subtitle")}</p>
            </div>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Filter size={20} className="mr-2" />
              {t("search.filters")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Advanced Filters Sidebar (from SearchPage) */}
          <div
            className={`lg:col-span-1 space-y-6 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {t("search.filters")}
              </h2>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Input */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <Search size={16} className="inline mr-1" />
                    {t("search.searchKeyword")}
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder={t("search.searchPlaceholder")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <Tag size={16} className="inline mr-1" />
                    {t("search.category")}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <MapPin size={16} className="inline mr-1" />
                    {t("search.location")}
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder={t("search.locationPlaceholder")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Date Range Filters */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    {t("search.dateRange")}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader size={20} className="animate-spin mx-auto" />
                  ) : (
                    t("search.searchButton")
                  )}
                </button>

                {/* Clear Filters */}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="w-full text-gray-600 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("search.clearFilters")}
                </button>
              </form>
            </div>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("search.resultsCount", { count: pagination.totalEvents })}
                </h2>
                {pagination.totalEvents > 0 && (
                  <p className="text-gray-600 text-sm mt-1">
                    {t("search.page")} {pagination.currentPage} {t("search.of")}{" "}
                    {pagination.totalPages}
                  </p>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader
                  size={40}
                  className="animate-spin mx-auto text-blue-600 mb-4"
                />
                <p className="text-gray-600">{t("search.searching")}</p>
              </div>
            )}

            {/* No Results */}
            {!loading && events.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {t("search.noResults")}
                </h3>
                <p className="text-gray-500">{t("search.noResultsDesc")}</p>
              </div>
            )}

            {/* Events Grid/List */}
            {!loading && events.length > 0 && (
              <>
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {Array.isArray(events) && events.length > 0 ? (
                    events.map((event) => (
                      <EventCard
                        event={event}
                        key={event._id}
                        handleEventClick={handleEventClick}
                        viewMode={viewMode}
                        formatDate={formatDate}
                        handleBookNow={handleBookNow}
                        getCategoryBadgeColor={getCategoryBadgeColor}
                        t={t}
                      />
                    ))
                  ) : (
                    <p className="text-gray-600">{t("eventsPage.noEvents")}</p>
                  )}
                </div>

                {/* Pagination (from SearchPage) */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      {t("search.previous")}
                    </button>

                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.totalPages ||
                          Math.abs(page - pagination.currentPage) <= 2
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] < page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pagination.currentPage
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      {t("search.next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
