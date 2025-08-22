import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Ticket, 
  Users, 
  BarChart3, 
  Plus, 
  Settings, 
  LogOut,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { authAPI, eventsAPI } from '../services/api';
import organizerAPI from '../services/organizerAPI';

const OrganizerDashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    activeEvents: 0
  });
  const [myEvents, setMyEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'organizer') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/login');
      return;
    }

    // Load organizer data
    loadOrganizerData();
  }, [navigate]);

  const loadOrganizerData = async () => {
    try {
      setError(null);
      
      // Fetch real data from API
      const [eventsResponse, bookingStatsResponse, bookingsResponse] = await Promise.all([
        organizerAPI.events.getMyEvents({ limit: 10 }),
        organizerAPI.bookings.getBookingStats(),
        organizerAPI.bookings.getMyBookings({ limit: 5 })
      ]);

      const myEventsData = eventsResponse.events || [];
      const statsData = bookingStatsResponse || {};
      const bookingsData = bookingsResponse.bookings || [];

      // Set events data
      setEvents(myEventsData.map(event => ({
        id: event._id,
        name: event.title,
        date: event.startDate,
        location: typeof event.location === 'object' ? event.location.address || event.location.city : event.location,
        ticketsSold: 0, // Will be calculated from bookings
        totalTickets: event.maxAttendees || 0,
        status: event.approved ? 'active' : 'pending'
      })));

      // Set dashboard overview data
      setMyEvents(myEventsData.slice(0, 3).map(event => ({
        id: event._id,
        name: event.title,
        date: organizerAPI.utils.formatDate(event.startDate)
      })));

      // Get tickets for recent events
      if (myEventsData.length > 0) {
        try {
          const ticketsPromises = myEventsData.slice(0, 2).map(event => 
            organizerAPI.tickets.getEventTickets(event._id).catch(() => [])
          );
          const ticketsResults = await Promise.all(ticketsPromises);
          const allTickets = ticketsResults.flat();
          
          setTickets(allTickets.slice(0, 5).map(ticket => ({
            id: ticket._id,
            eventName: ticket.type || 'Standard'
          })));
        } catch (ticketError) {
          console.warn('Could not load tickets:', ticketError);
          setTickets([]);
        }
      }

      // Set bookings data
      setBookings(bookingsData.map(booking => ({
        id: booking._id,
        customerName: booking.user?.userName || booking.attendeeInfo?.name || 'Unknown',
        tickets: booking.quantity || 1,
        eventName: booking.event?.title || 'Unknown Event'
      })));

      // Set statistics
      setStats({
        totalEvents: statsData.totalBookings ? myEventsData.length : 0,
        totalTicketsSold: statsData.totalBookings || 0,
        totalRevenue: statsData.totalRevenue || 0,
        activeEvents: myEventsData.filter(event => event.approved).length
      });

    } catch (error) {
      console.error('Error loading organizer data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // Fallback to empty data
      setEvents([]);
      setMyEvents([]);
      setTickets([]);
      setBookings([]);
      setStats({
        totalEvents: 0,
        totalTicketsSold: 0,
        totalRevenue: 0,
        activeEvents: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await organizerAPI.events.deleteEvent(eventId);
      // Refresh the data after successful deletion
      loadOrganizerData();
    } catch (error) {
      console.error('Delete event error:', error);
      setError('Failed to delete event. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#0052CC]">Tazkarti</h1>
              <span className="ml-4 text-gray-500">Organizer Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<Calendar className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Tickets Sold"
            value={stats.totalTicketsSold}
            icon={<Ticket className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`EGP ${stats.totalRevenue.toLocaleString()}`}
            icon={<BarChart3 className="w-6 h-6" />}
            color="purple"
          />

        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              title="Create New Event"
              description="Set up a new event and start selling tickets"
              icon={<Plus className="w-8 h-8" />}
              onClick={() => navigate('/create-event')}
              color="blue"
            />
            <ActionCard
              title="Manage Events"
              description="View and edit your existing events"
              icon={<Settings className="w-8 h-8" />}
              onClick={() => navigate('/manage-events')}
              color="green"
            />
  
          </div>
        </div>

        {/* New Feature Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* My Events Card */}
            <FeatureCard
              title="My Events"
              items={myEvents.length > 0 ? myEvents.map(event => `${event.name} - ${event.date}`) : ['No events yet']}
              icon={<Calendar className="w-6 h-6" />}
              color="blue"
            />
            
            {/* Tickets Card */}
            <FeatureCard
              title="Tickets"
              items={tickets.length > 0 ? tickets.map(ticket => `${ticket.eventName} Ticket`) : ['No tickets yet']}
              icon={<Ticket className="w-6 h-6" />}
              color="green"
            />
            
            {/* Bookings Card */}
            <FeatureCard
              title="Bookings"
              items={bookings.length > 0 ? bookings.map(booking => `${booking.customerName} - ${booking.tickets} Ticket${booking.tickets > 1 ? 's' : ''} for ${booking.eventName}`) : ['No bookings yet']}
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
 
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.length > 0 ? events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.ticketsSold} / {event.totalTickets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : event.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/events/${event.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Event"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/events/${event.id}/edit`)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-900 mb-2">No events yet</p>
                          <p className="text-sm text-gray-500 mb-4">Create your first event to get started</p>
                          <button
                            onClick={() => navigate('/create-event')}
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
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Action Card Component
const ActionCard = ({ title, description, icon, onClick, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    green: 'text-green-600 bg-green-50 hover:bg-green-100',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ title, items, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className={`${colorClasses[color]} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <h3 className="ml-3 text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="text-sm text-gray-600 py-1 border-b border-gray-100 last:border-b-0">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizerDashboard;