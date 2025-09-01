import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Ticket, 
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import organizerAPI from '../services/organizerAPI';

const ManageTickets = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTicketForm, setShowAddTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Form state for adding tickets
  const [ticketForm, setTicketForm] = useState({
    type: '',
    price: '',
    quantity: '',
    description: '',
    features: []
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setError(null);
      const response = await organizerAPI.events.getMyEvents({ limit: 50 });
      setEvents(response.events || []);
      
      // Auto-select first event if available
      if (response.events && response.events.length > 0) {
        setSelectedEvent(response.events[0]);
        loadTicketsForEvent(response.events[0]._id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketsForEvent = async (eventId) => {
    try {
      setError(null);
      const ticketsData = await organizerAPI.tickets.getEventTickets(eventId);
      setTickets(ticketsData || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    loadTicketsForEvent(event._id);
    setShowAddTicketForm(false);
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      setError('Please select an event first');
      return;
    }

    try {
      setError(null);
      
      const ticketData = {
        eventId: selectedEvent._id,
        type: ticketForm.type,
        price: parseFloat(ticketForm.price),
        quantity: parseInt(ticketForm.quantity),
        availableQuantity: parseInt(ticketForm.quantity),
        description: ticketForm.description,
        features: ticketForm.features.filter(f => f.trim() !== ''),
        status: 'active'
      };

      await organizerAPI.tickets.createTicket(ticketData);
      
      // Reset form and reload tickets
      setTicketForm({
        type: '',
        price: '',
        quantity: '',
        description: '',
        features: []
      });
      setShowAddTicketForm(false);
      loadTicketsForEvent(selectedEvent._id);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Failed to create ticket. Please try again.');
    }
  };

  const addFeature = () => {
    setTicketForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    setTicketForm(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index) => {
    setTicketForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/organizer-dashboard')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-[#0052CC]">Manage Tickets</h1>
            </div>
            {selectedEvent && (
              <button
                onClick={() => setShowAddTicketForm(true)}
                className="bg-[#0052CC] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Events</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredEvents.length > 0 ? filteredEvents.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => handleEventSelect(event)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedEvent?._id === event._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        event.approved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.approved ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No events found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tickets Management */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <div className="space-y-6">
                {/* Selected Event Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedEvent.title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(selectedEvent.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Max: {selectedEvent.maxAttendees || 'Unlimited'}
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {selectedEvent.approved ? 'Approved' : 'Pending Approval'}
                    </div>
                  </div>
                </div>

                {/* Add Ticket Form */}
                {showAddTicketForm && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Ticket Type</h3>
                    <form onSubmit={handleAddTicket} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ticket Type *
                          </label>
                          <select
                            value={ticketForm.type}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select ticket type</option>
                            <option value="Standard">Standard</option>
                            <option value="VIP">VIP</option>
                            <option value="Premium">Premium</option>
                            <option value="Early Bird">Early Bird</option>
                            <option value="Student">Student</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (EGP) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ticketForm.price}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, price: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={ticketForm.quantity}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, quantity: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <input
                            type="text"
                            value={ticketForm.description}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Brief description"
                          />
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Features (Optional)
                        </label>
                        {ticketForm.features.map((feature, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Front row seating, Meet & greet"
                            />
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addFeature}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Feature
                        </button>
                      </div>

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowAddTicketForm(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add Ticket
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Tickets List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Ticket Types</h3>
                  </div>
                  <div className="overflow-x-auto">
                    {tickets.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Available/Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tickets.map((ticket) => (
                            <tr key={ticket._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{ticket.type}</div>
                                  {ticket.description && (
                                    <div className="text-sm text-gray-500">{ticket.description}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-900">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  EGP {ticket.price}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {ticket.availableQuantity || 0} / {ticket.quantity || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  ticket.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {ticket.status || 'active'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No tickets yet</p>
                        <p className="text-sm text-gray-500 mb-4">Add ticket types to start selling</p>
                        <button
                          onClick={() => setShowAddTicketForm(true)}
                          className="bg-[#0052CC] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add First Ticket
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Event</h3>
                <p className="text-gray-500">Choose an event from the list to manage its tickets</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageTickets;
