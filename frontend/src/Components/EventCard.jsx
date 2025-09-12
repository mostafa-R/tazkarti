import { Calendar, MapPin } from "lucide-react";

function EventCard({
  handleEventClick,
  event,
  viewMode,
  formatDate,
  handleBookNow,
  getCategoryBadgeColor,
  t,
}) {
  return (
    <div
      key={event._id}
      onClick={() => handleEventClick(event)}
      className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 cursor-pointer ${
        viewMode === "list" ? "flex" : "flex flex-col h-full"
      }`}
    >
      <div
        className={`relative ${
          viewMode === "list" ? "w-64 flex-shrink-0" : ""
        }`}
      >
        <img
          src={
            event.images?.[0] ||
            "https://via.placeholder.com/400x300?text=No+Image"
          }
          alt={event.title}
          className={`w-full group-hover:scale-105 transition-transform duration-300 bg-gray-100 ${
            viewMode === "list" ? "h-48" : "h-48"
          }`}
        />

        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getCategoryBadgeColor(
              event.category
            )}`}
          >
            {event.category}
          </span>
        </div>
      </div>

      <div
        className={`p-6 ${
          viewMode === "list" ? "flex-1" : "flex flex-col flex-grow"
        }`}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 h-14 overflow-hidden">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3 h-16 overflow-hidden">
          {event.description}
        </p>

        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="h-4 w-4 mr-2 text-blue-500" />
          <span className="text-sm truncate">
            {formatDate(event.startDate)} {t("at")} {event.time}
          </span>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-2 text-red-500" />
          <span className="text-sm truncate">
            {typeof event.location === "string"
              ? event.location
              : `${event.location?.venue || "TBD"}, ${
                  event.location?.city || "TBD"
                }`}
          </span>
        </div>

        <div className="mt-auto">
          <button
            onClick={(e) => handleBookNow(event, e)}
            className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl ${
              viewMode === "list" ? "" : "w-full"
            }`}
          >
            {t("eventsPage.bookNow")} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
