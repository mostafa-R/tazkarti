import {
  BarChart3,
  Calendar,
  Eye,
  Plus,
  Settings,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrganizerNavbar from "../Components/OrganizerNavbar";
import { authAPI } from "../services/api";
import organizerAPI from "../services/organizerAPI";

const OrganizerDashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    activeEvents: 0,
  });
  const [myEvents, setMyEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "organizer") {
        navigate("/login");
        return;
      }
      setUser(parsedUser);
    } else {
      navigate("/login");
      return;
    }

    // Load organizer data
    loadOrganizerData();
  }, [navigate]);

  const loadOrganizerData = async () => {
    try {
      setError(null);

      // Fetch real data from API
      const [eventsResponse, bookingStatsResponse, bookingsResponse] =
        await Promise.all([
          organizerAPI.events.getMyEvents({ limit: 20 }),
          organizerAPI.bookings
            .getBookingStats()
            .catch(() => ({ totalBookings: 0, totalRevenue: 0 })),
          organizerAPI.bookings
            .getMyBookings({ limit: 10 })
            .catch(() => ({ bookings: [] })),
        ]);

      const myEventsData = eventsResponse.events || [];
      const statsData = bookingStatsResponse || {};
      const bookingsData = bookingsResponse.bookings || [];

      // Set events data
      setEvents(
        myEventsData.map((event) => ({
          id: event._id,
          name: event.title,
          date: event.startDate,
          location:
            typeof event.location === "object"
              ? event.location.venue ||
                event.location.city ||
                event.location.address
              : event.location,
          ticketsSold: 0, // Will be calculated from bookings
          totalTickets: event.maxAttendees || 0,
          status: event.approved ? "active" : "pending",
        }))
      );

      // Set dashboard overview data
      setMyEvents(
        myEventsData.slice(0, 5).map((event) => ({
          id: event._id,
          name: event.title,
          date: organizerAPI.utils.formatDate(event.startDate),
        }))
      );

      // Get tickets for events
      if (myEventsData.length > 0) {
        try {
          const ticketsPromises = myEventsData
            .slice(0, 3)
            .map((event) =>
              organizerAPI.tickets.getEventTickets(event._id).catch(() => [])
            );
          const ticketsResults = await Promise.all(ticketsPromises);
          const allTickets = ticketsResults.flat();

          setTickets(
            allTickets.slice(0, 8).map((ticket) => ({
              id: ticket._id,
              eventName: ticket.type || "Standard",
              price: ticket.price || 0,
              quantity: ticket.quantity || 0,
              available: ticket.availableQuantity || 0,
            }))
          );
        } catch (ticketError) {
          console.warn("Could not load tickets:", ticketError);
          setTickets([]);
        }
      }

      // Set bookings data
      setBookings(
        bookingsData.slice(0, 8).map((booking) => ({
          id: booking._id,
          customerName:
            booking.user?.userName || booking.attendeeInfo?.name || "Unknown",
          tickets: booking.quantity || 1,
          eventName: booking.event?.title || "Unknown Event",
          totalPrice: booking.totalPrice || 0,
          status: booking.status || "pending",
        }))
      );

      // Calculate proper statistics
      const totalTicketsSold = bookingsData.reduce(
        (sum, booking) => sum + (booking.quantity || 0),
        0
      );

      const totalRevenue = bookingsData
        .filter((booking) => booking.paymentStatus === "completed")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

      setStats({
        totalEvents: myEventsData.length,
        totalTicketsSold: totalTicketsSold,
        totalRevenue: totalRevenue,
        activeEvents: myEventsData.filter((event) => event.approved).length,
      });
    } catch (error) {
      console.error("Error loading organizer data:", error);
      setError("Failed to load dashboard data. Please try again.");

      // Fallback to empty data
      setEvents([]);
      setMyEvents([]);
      setTickets([]);
      setBookings([]);
      setStats({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        activeEvents: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Organizer Navbar */}
      <OrganizerNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
            <button
              onClick={loadOrganizerData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<Calendar className="w-5 h-5 lg:w-6 lg:h-6" />}
            color="blue"
          />
          <StatCard
            title="Tickets Sold"
            value={stats.totalTicketsSold}
            icon={<Ticket className="w-5 h-5 lg:w-6 lg:h-6" />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`EGP ${stats.totalRevenue.toLocaleString()}`}
            icon={<BarChart3 className="w-5 h-5 lg:w-6 lg:h-6" />}
            color="purple"
          />
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            icon={<Users className="w-5 h-5 lg:w-6 lg:h-6" />}
            color="orange"
          />
        </div>

        {/* Core Features - Simplified to 3 main actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <ActionCard
              title="Create New Event"
              description="Set up a new event for your audience"
              icon={<Plus className="w-6 h-6 lg:w-8 lg:h-8" />}
              onClick={() => navigate("/create-event")}
              color="blue"
            />
            <ActionCard
              title="Manage Tickets"
              description="Add and view ticket types for your events"
              icon={<Ticket className="w-6 h-6 lg:w-8 lg:h-8" />}
              onClick={() => navigate("/manage-tickets")}
              color="green"
            />
            <ActionCard
              title="View Bookings"
              description="Monitor bookings and customer details"
              icon={<Users className="w-6 h-6 lg:w-8 lg:h-8" />}
              onClick={() => navigate("/view-bookings")}
              color="purple"
            />
          </div>
        </div>

        {/* Dashboard Overview - 3 Core Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Events Card */}
            <FeatureCard
              title="My Events"
              items={
                myEvents.length > 0
                  ? myEvents.map((event) => `${event.name} - ${event.date}`)
                  : ["No events yet"]
              }
              icon={<Calendar className="w-6 h-6" />}
              color="blue"
              actionText="Create Event"
              onAction={() => navigate("/create-event")}
            />

            {/* Tickets Card */}
            <FeatureCard
              title="Tickets"
              items={
                tickets.length > 0
                  ? tickets.map(
                      (ticket) =>
                        `${ticket.eventName} - EGP ${ticket.price} (${ticket.available}/${ticket.quantity})`
                    )
                  : ["No tickets yet"]
              }
              icon={<Ticket className="w-6 h-6" />}
              color="green"
              actionText="Manage Tickets"
              onAction={() => navigate("/manage-tickets")}
            />

            {/* Bookings Card */}
            <FeatureCard
              title="Recent Bookings"
              items={
                bookings.length > 0
                  ? bookings.map(
                      (booking) =>
                        `${booking.customerName} - ${booking.tickets} ticket${
                          booking.tickets > 1 ? "s" : ""
                        } (EGP ${booking.totalPrice})`
                    )
                  : ["No bookings yet"]
              }
              icon={<Users className="w-6 h-6" />}
              color="purple"
              actionText="View All"
              onAction={() => navigate("/view-bookings")}
            />
          </div>
        </div>

        {/* Events Table - Simplified (View Only) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Location
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {/* <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th> */}
                  </tr>
                  
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {event.name}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                          {event.location}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              event.status === "active"
                                ? "bg-green-100 text-green-800"
                                : event.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        {/* <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/events/${event.id}`)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Event"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(`/events/${event.id}/tickets`)
                              }
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Manage Tickets"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </div>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center">
                          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            No events yet
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            Create your first event to get started
                          </p>
                          <button
                            onClick={() => navigate("/create-event")}
                            className="bg-[#0052CC] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Create Event
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 lg:p-6">
      <div className="flex items-center">
        <div
          className={`${colorClasses[color]} text-white p-2 lg:p-3 rounded-lg`}
        >
          {icon}
        </div>
        <div className="ml-3 lg:ml-4 min-w-0 flex-1">
          <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <p className="text-lg lg:text-2xl font-semibold text-gray-900 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ title, description, icon, onClick, color }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 hover:bg-blue-100",
    green: "text-green-600 bg-green-50 hover:bg-green-100",
    purple: "text-purple-600 bg-purple-50 hover:bg-purple-100",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow p-4 lg:p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div
        className={`${colorClasses[color]} w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center mb-3 lg:mb-4`}
      >
        {icon}
      </div>
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, items, icon, color, actionText, onAction }) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div
            className={`${colorClasses[color]} text-white p-2 lg:p-3 rounded-lg`}
          >
            {icon}
          </div>
          <h3 className="ml-3 text-base lg:text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>
        {actionText && (
          <button
            onClick={onAction}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {actionText}
          </button>
        )}
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {items.slice(0, 5).map((item, index) => (
          <div
            key={index}
            className="text-sm text-gray-600 py-1 border-b border-gray-100 last:border-b-0"
          >
            {item}
          </div>
        ))}
        {items.length > 5 && (
          <div className="text-xs text-gray-400 pt-2">
            +{items.length - 5} more...
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
