import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; 
import { ArrowLeft, Calendar, Clock, MapPin, Heart, Share2, Star, Users, Music, Award } from 'lucide-react';

const EventDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const location = useLocation(); 
  
  const [selectedTicket, setSelectedTicket] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const receivedEvent = location.state?.event;
  
  const defaultEvents = {
    '1': {
      id: '1',
      title: 'Rock Concert 2024',
      date: 'March 15, 2024',
      time: '8:00 PM - 12:00 AM',
      location: 'Stadium Arena, New York',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop',
      description: 'Experience the best rock music live! Join thousands of fans for an unforgettable night of electrifying performances by top rock bands.',
      price: { Regular: 45, VIP: 85, Premium: 120 },
      availableTickets: 250,
      category: 'Music',
      organizer: 'Rock Events Co.',
      rating: 4.8,
    },
    '2': {
      id: '2',
      title: 'Football Championship',
      date: 'March 20, 2024',
      time: '6:00 PM - 9:00 PM',
      location: 'National Stadium, Los Angeles',
      image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop',
      description: 'Championship final match! Witness the ultimate showdown between the top teams in an epic football championship final.',
      price: { Regular: 30, VIP: 60, Premium: 90 },
      availableTickets: 500,
      category: 'Sports',
      organizer: 'Sports League',
      rating: 4.5,
    },
    '3': {
      id: '3',
      title: 'Tech Conference 2024',
      date: 'March 25, 2024',
      time: '9:00 AM - 6:00 PM',
      location: 'Convention Center, Chicago',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      description: 'Latest trends in technology. Connect with industry leaders and discover cutting-edge innovations shaping our future.',
      price: { Regular: 120, VIP: 200, Premium: 300 },
      availableTickets: 80,
      category: 'Education',
      organizer: 'Tech Innovators',
      rating: 4.7,
    },
    '4': {
      id: '4',
      title: 'Broadway Musical',
      date: 'April 1, 2024',
      time: '7:30 PM - 10:00 PM',
      location: 'City Theater, New York',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      description: 'Award-winning Broadway show. Experience the magic of live theater with this critically acclaimed musical performance.',
      price: { Regular: 75, VIP: 125, Premium: 180 },
      availableTickets: 120,
      category: 'Theater',
      organizer: 'Broadway Productions',
      rating: 4.9,
    },
    '5': {
      id: '5',
      title: 'Movie Premiere',
      date: 'April 5, 2024',
      time: '9:00 PM - 11:30 PM',
      location: 'Cinema Complex, Los Angeles',
      image: 'https://images.unsplash.com/photo-1489599511777-9c0c0c41b2c4?w=400&h=300&fit=crop',
      description: 'Exclusive movie premiere. Be among the first to watch this highly anticipated blockbuster with the cast and crew.',
      price: { Regular: 25, VIP: 45, Premium: 65 },
      availableTickets: 30,
      category: 'Movies',
      organizer: 'Film Studios',
      rating: 4.3,
    },
    '6': {
      id: '6',
      title: 'Jazz Festival',
      date: 'April 10, 2024',
      time: '7:00 PM - 11:00 PM',
      location: 'Park Amphitheater, Chicago',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      description: 'Smooth jazz under the stars. Enjoy an evening of soulful jazz music performed by renowned artists in a beautiful outdoor setting.',
      price: { Regular: 60, VIP: 100, Premium: 140 },
      availableTickets: 150,
      category: 'Music',
      organizer: 'Jazz Society',
      rating: 4.6,
    }
  };

  const event = receivedEvent || defaultEvents[id] || defaultEvents['1'];

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
    navigate(`/booking/${event.id}`, { 
      state: { 
        event: {
          ...event,
          selectedTicket,
          quantity,
          subtotal: event.price[selectedTicket] * quantity,
          serviceFee: 5,
          total: event.price[selectedTicket] * quantity + 5
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
            <img src={event.image} alt={event.title} className="w-full h-96 object-cover rounded-xl shadow-lg" />
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{event.title}</h1>
                <p className="text-gray-500 flex items-center"><Calendar className="mr-2" size={18} /> {event.date}</p>
                <p className="text-gray-500 flex items-center"><Clock className="mr-2" size={18} /> {event.time}</p>
                <p className="text-gray-500 flex items-center"><MapPin className="mr-2" size={18} /> {event.location}</p>
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
              <span className="flex items-center mb-2"><Users className="mr-2" size={18} /> {event.availableTickets} Tickets</span>
              <span className="flex items-center mb-2"><Music className="mr-2" size={18} /> {event.category}</span>
              <span className="flex items-center mb-2"><Award className="mr-2" size={18} /> {event.organizer}</span>
              <span className="flex items-center mb-2"><Star className="mr-2" size={18} /> {event.rating}</span>
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
                  <option value="Regular">Regular - ${event.price.Regular}</option>
                  <option value="VIP">VIP - ${event.price.VIP}</option>
                  <option value="Premium">Premium - ${event.price.Premium}</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={Math.min(event.availableTickets, 10)} 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-gray-700 font-medium mb-2">
                  <span>Subtotal</span>
                  <span>${event.price[selectedTicket] * quantity}</span>
                </div>
                <div className="flex justify-between text-gray-700 mb-2">
                  <span>Service Fee</span>
                  <span>$5</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg">
                  <span>Total</span>
                  <span>${event.price[selectedTicket] * quantity + 5}</span>
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