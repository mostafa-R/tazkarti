import { ArrowLeft, Calendar, Download, MapPin } from 'lucide-react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const mockTickets = [
  {
    id: '1',
    event: {
      title: "Jazz Night 2024",
      date: "March 15, 2024 at 8:00 PM",
      location: "Blue Note Jazz Club",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
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
    id: '2',
    event: {
      title: "Rock Festival 2024",
      date: "April 22, 2024 at 6:00 PM",
      location: "Central Park Arena",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop"
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
    id: '3',
    event: {
      title: "Electronic Music Festival",
      date: "May 5, 2024 at 10:00 PM",
      location: "Warehouse District",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
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

const getStatusBadge = (status) => {
  const statusStyles = {
    'Upcoming': 'bg-green-100 text-green-800',
    'Past': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  return statusStyles[status] || 'bg-gray-100 text-gray-800';
};

const TicketDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketData = mockTickets.find(t => t.id === id);

  if (!ticketData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-4">The ticket you are looking for does not exist.</p>
          <button
            onClick={() => navigate('/my-tickets')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/my-tickets')}
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusBadge(ticketData.status)}`}>
            {ticketData.status}
          </span>
        </div>

        {/* Ticket Card */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <img
            src={ticketData.event.image}
            alt={ticketData.event.title}
            className="w-full h-64 object-cover"
          />

          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{ticketData.event.title}</h2>
            <div className="flex items-center text-gray-600 mb-1">
              <Calendar className="h-4 w-4 mr-2" />
              {ticketData.event.date}
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="h-4 w-4 mr-2" />
              {ticketData.event.location}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500 block">Ticket Type</span>
                <span className="font-medium text-gray-900">{ticketData.ticket.type}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Quantity</span>
                <span className="font-medium text-gray-900">{ticketData.ticket.quantity} ticket(s)</span>
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

            <button className="mt-4 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;
