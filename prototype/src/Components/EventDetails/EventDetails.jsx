import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../config/axiosConfig.js";
import Tickets from "./Tickets.jsx";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    axios.get(`/events/${id}`).then((res) => {
      setEvent(res.data);
      setTickets(res.data.tickets);
    });
  }, [id]);

  if (!event) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-auto ">
          <h1 className="text-4xl font-extrabold text-gray-800 ">
            {event.title}
          </h1>

          <img
            src={event.images?.[0]}
            alt={event.title}
            className="w-full h-60 max-w-xl rounded-xl shadow-lg border"
          />

          <p className="text-gray-700text-lg leading-relaxed">
            {event.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-gray-600  text-sm">
            <p>
              <span className="font-semibold text-gray-800">📅 From:</span>{" "}
              {new Date(event.startDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold text-gray-800">📅 To:</span>{" "}
              {new Date(event.endDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold text-gray-800">⏰ Time:</span>{" "}
              {event.time}
            </p>
            <p>
              <span className="font-semibold text-gray-800">📍 Location:</span>{" "}
              {event.location?.venue}, {event.location?.city}
            </p>
            <p>
              <span className="font-semibold text-gray-800">
                ✅ Available Spots:
              </span>{" "}
              {event.availableSpots}
            </p>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
            Available Tickets
          </h2>
          <Tickets tickets={tickets} />
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
