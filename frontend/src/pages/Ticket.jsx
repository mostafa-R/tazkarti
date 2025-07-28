import React, { useState } from 'react';
import { Calendar, MapPin, Search, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyTicketsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const tickets = [
    {
      id: 1,
      event: {
        title: "Jazz Night 2024",
        date: "March 15, 2024 at 8:00 PM",
        location: "Blue Note Jazz Club",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"
      },
      ticket: {
        type: "VIP",
        quantity: 2,
        totalPrice: 180,
        bookingCode: "TZK-JN-001234"
      },
      status: "Upcoming"
    },
    {
      id: 2,
      event: {
        title: "Rock Festival 2024",
        date: "April 22, 2024 at 6:00 PM",
        location: "Central Park Arena",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300&h=200&fit=crop"
      },
      ticket: {
        type: "Regular",
        quantity: 4,
        totalPrice: 320,
        bookingCode: "TZK-RF-005678"
      },
      status: "Upcoming"
    },
    {
      id: 3,
      event: {
        title: "Electronic Music Festival",
        date: "May 5, 2024 at 10:00 PM",
        location: "Warehouse District",
        image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop"
      },
      ticket: {
        type: "VIP",
        quantity: 1,
        totalPrice: 150,
        bookingCode: "TZK-EMF-445566"
      },
      status: "Upcoming"
    }
  ];

  const filterOptions = [
    { label: 'All', count: 5 },
    { label: 'Upcoming', count: 3 },
    { label: 'Past', count: 1 },
    { label: 'Cancelled', count: 1 }
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || ticket.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusStyles = {
      'Upcoming': 'bg-green-100 text-green-800',
      'Past': 'bg-gray-100 text-gray-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };

    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">Manage and access all your event tickets</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events or venues..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {filterOptions.map((filter) => (
                <button
                  key={filter.label}
                  onClick={() => setActiveFilter(filter.label)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter.label
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-6">
          {filteredTickets.map((ticketData) => (
            <div key={ticketData.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row">
                {/* Event Image */}
                <div className="md:w-64 h-48 md:h-auto relative">
                  <img
                    src={ticketData.event.image}
                    alt={ticketData.event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticketData.status)}`}>
                      <span className="inline-block w-2 h-2 bg-current rounded-full mr-1"></span>
                      {ticketData.status}
                    </span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{ticketData.event.title}</h3>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">{ticketData.event.date}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="text-sm">{ticketData.event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Information */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500 block">Ticket Type</span>
                      <span className="font-medium text-gray-900">{ticketData.ticket.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Quantity</span>
                      <span className="font-medium text-gray-900">{ticketData.ticket.quantity} tickets</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Total Price</span>
                      <span className="font-medium text-blue-600">${ticketData.ticket.totalPrice}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Booking Code</span>
                      <span className="font-medium text-gray-900">{ticketData.ticket.bookingCode}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate(`/my-tickets/${ticketData.id}`)}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Ticket
                    </button>
                    <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Download className="h-4 w-4 mr-2" />
                      Download QR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "Try adjusting your search criteria" 
                : "You don't have any tickets yet. Start exploring events!"}
            </p>
          </div>
        )}

        {/* Support Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-700 mb-4">Having trouble with your tickets? Our support team is here to help.</p>
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
