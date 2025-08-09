import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; 
import { ArrowLeft, Calendar, Clock, MapPin, Heart, Share2, Star, Users, Music, Award } from 'lucide-react';
import { eventsAPI } from '../services/api';

const EventDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const location = useLocation(); 
  
  const [selectedTicket, setSelectedTicket] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  
  // State for real event data
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIXED: Move helper function to the top before it's used
  const normalizeEventData = (eventData) => {
    return {
      ...eventData,
      // Handle location (could be string or object)
      location: typeof eventData.location === 'string' 
        ? { venue: eventData.location, city: eventData.location }
        : eventData.location || { venue: 'TBD', city: 'TBD' },
      
      // Handle organizer (could be missing)
      organizer: eventData.organizer || { name: 'Unknown Organizer', email: 'unknown@example.com' },
      
      // Handle images (could be empty array or missing)
      images: eventData.images && eventData.images.length > 0 
        ? eventData.images.map(img => img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`)
        : eventData.image 
          ? [eventData.image] 
          : ['https://via.placeholder.com/800x400?text=No+Image'],
      
      // Handle date fields
      startDate: eventData.startDate ? new Date(eventData.startDate).toLocaleDateString() : eventData.date,
      
      // Handle missing fields with defaults
      currentAttendees: eventData.currentAttendees || 0,
      maxAttendees: eventData.maxAttendees || 100,
      category: eventData.category || 'Other',
      description: eventData.description || 'No description available',
      time: eventData.time || 'TBD'
    };
  };

  // Function to fetch event data from backend
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching event details for ID:', id);
      console.log('🌐 API URL:', `http://localhost:5000/events/${id}`);
      
      // Call the API to get event details
      const response = await eventsAPI.getEventById(id);
      
      console.log('✅ API Response:', response.data);
      
      // Normalize and update state with real event data
      const normalizedEvent = normalizeEventData(response.data);
      console.log('🔄 Normalized Event Data:', normalizedEvent);
      setEvent(normalizedEvent);
      
    } catch (err) {
      console.error('❌ Error fetching event details:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError('Failed to load event details');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch event details when component loads
  useEffect(() => {
    console.log('🎯 EventDetails component mounted with ID:', id);
    if (id) {
      fetchEventDetails();
    } else {
      console.log('⚠️ No event ID provided');
      setLoading(false);
      setError('No event ID provided');
    }
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchEventDetails}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No event found
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Event not found.</p>
          <button 
            onClick={() => navigate('/events')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get ticket price
  const getTicketPrice = (ticketType) => {
    const prices = {
      'Regular': 45,
      'VIP': 85,
      'Premium': 120
    };
    return prices[ticketType] || 45;
  };

  const relatedEvents = [
    {
      id: '124',
      title: 'Sunset Vibes',
      date: 'September 2, 2025',
      location: 'North Coast Arena',
      image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '125',
      title: 'Night Pulse',
      date: 'October 12, 2025',
      location: 'Cairo Festival City',
      image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1470&q=80',
    }
  ];

  const handleBookNow = () => {
    navigate(`/booking/${event._id}`, { 
      state: { 
        event: {
          ...event,
          selectedTicket,
          quantity,
          subtotal: getTicketPrice(selectedTicket) * quantity,
          serviceFee: 5,
          total: getTicketPrice(selectedTicket) * quantity + 5
        }
      }
    });
  };

  const handleRelatedEventClick = (relatedEventId) => {
    navigate(`/event/${relatedEventId}`);
  };

  const handleBack = () => {
    if (document.referrer.includes('/events')) {
      navigate('/events');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="text-blue-600 cursor-pointer hover:underline">
            <ArrowLeft className="inline-block mr-2" size={20} />
            Back to Events
          </button>
        </div>

        {/* Main Event Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left Section: Image & Info */}
          <div className="md:col-span-2 space-y-6">
            <img src={event.images[0]} alt={event.title} className="w-full h-96 object-cover rounded-xl shadow-lg" />
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{event.title}</h1>
                <p className="text-gray-500 flex items-center"><Calendar className="mr-2" size={18} /> {event.startDate}</p>
                <p className="text-gray-500 flex items-center"><Clock className="mr-2" size={18} /> {event.time}</p>
                <p className="text-gray-500 flex items-center"><MapPin className="mr-2" size={18} /> {event.location.venue}, {event.location.city}</p>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setIsLiked(!isLiked)}>
                  <Heart size={24} className={isLiked ? 'text-red-500 fill-current' : 'text-gray-400'} />
                </button>
                <button><Share2 size={24} className="text-gray-400" /></button>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
            <div className="flex space-x-6 text-gray-600 mt-4 flex-wrap">
              <span className="flex items-center mb-2"><Users className="mr-2" size={18} /> {event.currentAttendees} / {event.maxAttendees} Tickets</span>
              <span className="flex items-center mb-2"><Music className="mr-2" size={18} /> {event.category}</span>
              <span className="flex items-center mb-2"><Award className="mr-2" size={18} /> {event.organizer.name}</span>
              <span className="flex items-center mb-2"><Star className="mr-2" size={18} /> 4.8</span>
            </div>
          </div>

          {/* Right Section: Booking Card */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-800">Book Your Spot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Ticket Type</label>
                <select
                  value={selectedTicket}
                  onChange={(e) => setSelectedTicket(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Regular">Regular - $45</option>
                  <option value="VIP">VIP - $85</option>
                  <option value="Premium">Premium - $120</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={Math.min(event.maxAttendees - event.currentAttendees, 10)} 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-gray-700 font-medium mb-2">
                  <span>Subtotal</span>
                  <span>${getTicketPrice(selectedTicket) * quantity}</span>
                </div>
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Service Fee</span>
                  <span>$5</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg">
                  <span>Total</span>
                  <span>${getTicketPrice(selectedTicket) * quantity + 5}</span>
                </div>
              </div>
              <button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Book Now →
              </button>
            </div>
          </div>
        </div>

        {/* Related Events */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">You Might Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((relatedEvent) => (
              <div
                key={relatedEvent.id}
                onClick={() => handleRelatedEventClick(relatedEvent.id)} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
              >
                <img src={relatedEvent.image} alt={relatedEvent.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{relatedEvent.title}</h4>
                  <p className="text-gray-500 text-sm">{relatedEvent.date} · {relatedEvent.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;