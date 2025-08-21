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

const OrganizerDashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    activeEvents: 0
  });
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
      // This would be replaced with actual API calls
      // For now, using mock data
      setEvents([
        {
          id: 1,
          name: 'Tech Conference 2024',
          date: '2024-03-15',
          location: 'Cairo Convention Center',
          ticketsSold: 150,
          totalTickets: 200,
          status: 'active'
        },
        {
          id: 2,
          name: 'Music Festival',
          date: '2024-04-20',
          location: 'New Capital',
          ticketsSold: 75,
          totalTickets: 300,
          status: 'active'
        }
      ]);

      setStats({
        totalEvents: 2,
        totalTicketsSold: 225,
        totalRevenue: 45000,
        activeEvents: 2
      });
    } catch (error) {
      console.error('Error loading organizer data:', error);
    } finally {
      setIsLoading(false);
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
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            icon={<Users className="w-6 h-6" />}
            color="orange"
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
            <ActionCard
              title="Analytics"
              description="View detailed reports and analytics"
              icon={<BarChart3 className="w-8 h-8" />}
              onClick={() => navigate('/analytics')}
              color="purple"
            />
          </div>
        </div>

        {/* Recent Events */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
            <button
              onClick={() => navigate('/create-event')}
              className="bg-[#0052CC] text-white px-4 py-2 rounded-lg hover:bg-[#003d99] transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </button>
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
                  {events.map((event) => (
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
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

export default OrganizerDashboard;
