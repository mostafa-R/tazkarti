import { useEffect, useState } from "react";
import axios from "../../config/axiosConfig.js";
import { Link } from "react-router-dom";

function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get("/events");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    }

    fetchEvents();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
        {events.map((event) => (
          <Link
            to={`/events/${event._id}`}
            key={event._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300"
          >
            <img
              src={event.images[0]}
              alt={event.title}
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <h2 className="text-xl font-semibold text-blue-600 mb-1">
                {event.title}
              </h2>
              <p className="text-gray-600 text-sm mb-2">{event.description}</p>

              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Category:</span> {event.category}
              </div>

              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Date:</span>{" "}
                {new Date(event.startDate).toLocaleDateString()} –{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </div>

              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Time:</span> {event.time}
              </div>

              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Venue:</span>{" "}
                {event.location?.venue}
              </div>

              <div className="text-sm text-gray-500">
                <span className="font-medium">Address:</span>{" "}
                {event.location?.address}, {event.location?.city}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default Home;
