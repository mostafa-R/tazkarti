import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Clock, MapPin, Heart, Share2, Star, Users, Music, Award } from 'lucide-react';
import { eventsAPI } from '../services/api';
import { ticketsAPI } from '../services/api';   

const EventDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const location = useLocation(); 
  const { t } = useTranslation();
  
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeEventData = (eventData) => {
    return {
      ...eventData,
      location: typeof eventData.location === 'string' 
        ? { venue: eventData.location, city: eventData.location }
        : eventData.location || { venue: 'TBD', city: 'TBD' },
      organizer: eventData.organizer || { name: t('eventDetails.unknownOrganizer'), email: 'unknown@example.com' },
      images: eventData.images && eventData.images.length > 0 
        ? eventData.images.map(img => img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`)
        : eventData.image 
          ? [eventData.image] 
          : ['https://via.placeholder.com/800x400?text=No+Image'],
      startDate: eventData.startDate ? new Date(eventData.startDate).toLocaleDateString() : eventData.date,
      currentAttendees: eventData.currentAttendees || 0,
      maxAttendees: eventData.maxAttendees || 100,
      category: eventData.category || t('eventDetails.other'),
      description: eventData.description || t('eventDetails.noDescription'),
      time: eventData.time || 'TBD'
    };
  };

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getEventById(id);
      const normalizedEvent = normalizeEventData(response.data);
      setEvent(normalizedEvent);
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError(t('eventDetails.loadError'));
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await ticketsAPI.getTicketsForEvent(id);
      setTickets(response.data);
      if (response.data && response.data.length > 0) {
        setSelectedTicket(response.data[0]);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      if (err.response?.status === 404) {
        console.log('No tickets found for this event');
        setTickets([]);
      }
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchTickets();
    } else {
      setLoading(false);
      setError(t('eventDetails.noEventId'));
    }
  }, [id]);

  const getTicketPrice = () => {
    return selectedTicket ? selectedTicket.price : 0;
  };

  const getAvailableQuantity = () => {
    return selectedTicket ? selectedTicket.availableQuantity : 0;
  };

  const relatedEvents = [
    {
      id: '124',
      title: t('eventDetails.relatedEvents.sunsetVibes'),
      date: t('eventDetails.relatedEvents.sep2'),
      location: t('eventDetails.relatedEvents.northCoast'),
      image: 'https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: '125',
      title: t('eventDetails.relatedEvents.nightPulse'),
      date: t('eventDetails.relatedEvents.oct12'),
      location: t('eventDetails.relatedEvents.cairoFestival'),
      image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1470&q=80',
    }
  ];

  const handleBookNow = () => {
    if (!selectedTicket) {
      toast.error(t('eventDetails.selectTicketAlert'));

      return;
    }

    navigate(`/booking/${event._id}`, { 
      state: { 
        event: {
          ...event,
          selectedTicket,
          quantity,
          subtotal: getTicketPrice() * quantity,
          serviceFee: 5,
          total: getTicketPrice() * quantity + 5
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('eventDetails.loading')}</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchEventDetails}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t('eventDetails.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('eventDetails.notFound')}</p>
          <button 
            onClick={() => navigate('/events')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4"
          >
            {t('eventDetails.backToEvents')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button onClick={handleBack} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center">
            <ArrowLeft className="mr-2" size={20} />
            {t('eventDetails.backButton')}
          </button>
        </div>

        {/* Main Event Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section: Image & Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img 
                src={event.images[0]} 
                alt={event.title} 
                className="w-full h-96 object-cover transition-transform duration-300 hover:scale-105" 
              />
              <div className="absolute top-4 right-4 flex space-x-3">
                <button 
                  onClick={() => setIsLiked(!isLiked)} 
                  className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <Heart size={20} className={isLiked ? 'text-red-500 fill-current' : 'text-gray-600'} />
                </button>
                <button className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                  <Share2 size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="mr-3 text-blue-500" size={20} />
                  <div>
                    <p className="font-medium">{t('eventDetails.date')}</p>
                    <p>{event.startDate}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Clock className="mr-3 text-blue-500" size={20} />
                  <div>
                    <p className="font-medium">{t('eventDetails.time')}</p>
                    <p>{event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <MapPin className="mr-3 text-blue-500" size={20} />
                  <div>
                    <p className="font-medium">{t('eventDetails.location')}</p>
                    <p>{event.location.venue}, {event.location.city}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <Award className="mr-3 text-blue-500" size={20} />
                  <div>
                    <p className="font-medium">{t('eventDetails.organizer')}</p>
                    <p>{event.organizer.name}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-xl font-semibold mb-3">{t('eventDetails.aboutEvent')}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Section: Booking Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 h-fit sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('eventDetails.bookYourSpot')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t('eventDetails.ticketType')}
                </label>
                {loadingTickets ? (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500 animate-pulse">
                    {t('eventDetails.loadingTickets')}
                  </div>
                ) : tickets.length > 0 ? (
                  <select
                    value={selectedTicket?._id || ''}
                    onChange={(e) => {
                      const ticket = tickets.find(t => t._id === e.target.value);
                      setSelectedTicket(ticket);
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {tickets.map(ticket => (
                      <option key={ticket._id} value={ticket._id}>
                        {ticket.type} - {ticket.price} {ticket.currency} 
                        ({ticket.availableQuantity} {t('eventDetails.available')})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-500">
                    {t('eventDetails.noTickets')}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  {t('eventDetails.quantity')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.min(getAvailableQuantity(), 10)}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedTicket || getAvailableQuantity() === 0}
                />
                {selectedTicket && (
                  <p className="text-sm text-gray-500 mt-2">
                    {getAvailableQuantity()} {t('eventDetails.ticketsAvailable')}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>{t('eventDetails.subtotal')}</span>
                  <span>{getTicketPrice() * quantity} {selectedTicket?.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{t('eventDetails.serviceFee')}</span>
                  <span>5 {selectedTicket?.currency || 'EGP'}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg pt-2">
                  <span>{t('eventDetails.total')}</span>
                  <span>{getTicketPrice() * quantity + 5} {selectedTicket?.currency || 'EGP'}</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={!selectedTicket || getAvailableQuantity() === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium shadow-lg transition-all duration-300 ${
                  !selectedTicket || getAvailableQuantity() === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                }`}
              >
                {t('eventDetails.bookNow')} →
              </button>
            </div>
          </div>
        </div>

        {/* Related Events */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6 text-gray-900">
            {t('eventDetails.youMightLike')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((relatedEvent) => (
              <div
                key={relatedEvent.id}
                onClick={() => handleRelatedEventClick(relatedEvent.id)} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="relative overflow-hidden h-48">
                  <img 
                    src={relatedEvent.image} 
                    alt={relatedEvent.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {relatedEvent.title}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {relatedEvent.date} · {relatedEvent.location}
                  </p>
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