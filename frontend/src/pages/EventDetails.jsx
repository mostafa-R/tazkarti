import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Heart, Share2, Star, Users, Music, Award } from 'lucide-react';

const EventDetailsPage = () => {
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState('Regular');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const event = {
    id: '123',
    title: 'Electric Future Fest',
    date: 'August 25, 2025',
    time: '6:00 PM - 12:00 AM',
    location: 'Zed Park, Sheikh Zayed',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1470&q=80',
    description: 'Join us for an electrifying night of music and lights at the Electric Future Fest. Experience performances by top DJs and artists in a futuristic setting.',
    price: {
      Regular: 45,
      VIP: 85,
      Premium: 120
    },
    availableTickets: 50,
    category: 'Music',
    organizer: 'Eventive Live',
    rating: 4.7
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
    navigate(`/booking/${event.id}?ticket=${selectedTicket}&quantity=${quantity}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button onClick={() => navigate('/events')} className="text-blue-600 cursor-pointer hover:underline">
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
            <div className="flex space-x-6 text-gray-600 mt-4">
              <span className="flex items-center"><Users className="mr-2" size={18} /> {event.availableTickets} Tickets</span>
              <span className="flex items-center"><Music className="mr-2" size={18} /> {event.category}</span>
              <span className="flex items-center"><Award className="mr-2" size={18} /> {event.organizer}</span>
              <span className="flex items-center"><Star className="mr-2" size={18} /> {event.rating}</span>
            </div>
          </div>

          {/* Right Section: Booking Card */}
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Book Your Spot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Ticket Type</label>
                <select
                  value={selectedTicket}
                  onChange={(e) => setSelectedTicket(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                  max={event.availableTickets}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-between text-gray-700 font-medium">
                <span>Subtotal</span>
                <span>${event.price[selectedTicket] * quantity}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Service Fee</span>
                <span>$5</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-lg">
                <span>Total</span>
                <span>${event.price[selectedTicket] * quantity + 5}</span>
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
                onClick={() => navigate(`/events/${relatedEvent.id}`)}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
              >
                <img src={relatedEvent.image} alt={relatedEvent.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800">{relatedEvent.title}</h4>
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
