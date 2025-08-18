import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, MapPin, ChevronDown, Grid, List, Star, Users } from 'lucide-react';
import { eventsAPI } from '../services/api.js';

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [viewMode, setViewMode] = useState('grid');
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['all', 'sports', 'music', 'theater', 'education', 'movies'];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getAllEvents();
      setAllEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(t('eventsPage.noEvents'));
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeFilter === 'all' || event.category.toLowerCase() === activeFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'music': 'bg-purple-100 text-purple-800',
      'sports': 'bg-red-100 text-red-800',
      'theater': 'bg-green-100 text-green-800',
      'education': 'bg-blue-100 text-blue-800',
      'movies': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const handleEventClick = (event) => {
    navigate(`/event/${event._id}`, { state: { event } });
  };

  const handleBookNow = (event, e) => {
    e.stopPropagation();
    navigate(`/booking/${event._id}`, { state: { event } });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('eventsPage.title')}</h1>
          <p className="text-gray-600">{t('eventsPage.subtitle')}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('eventsPage.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select 
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[150px]"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">{t('eventsPage.allLocations')}</option>
                  <option value="new-york">New York</option>
                  <option value="los-angeles">Los Angeles</option>
                  <option value="dubai">Dubai</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
              
              <input
                type="date"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder={t('eventsPage.selectDate')}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t(`eventsPage.categories.${category}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {t('eventsPage.showingEvents', { count: filteredEvents.length })}
          </p>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchEvents}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t('tryAgain')}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">{t('eventsPage.noEvents')}</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  key={event._id}
                  onClick={() => handleEventClick(event)}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 cursor-pointer ${viewMode === 'list' ? 'flex' : ''}`}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                    <img
                      src={event.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={event.title}
                      className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                        viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                      }`}
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      ${event.price || t('eventsPage.free')}
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getCategoryBadgeColor(event.category)}`}>
                        {t(`eventsPage.categories.${event.category.toLowerCase()}`)}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">{event.startDate} {t('at')} {event.time}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm">
                        {event.location?.venue || 'TBD'}, {event.location?.city || 'TBD'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={(e) => handleBookNow(event, e)}
                      className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl ${
                        viewMode === 'list' ? '' : 'w-full'
                      }`}
                    >
                      {t('eventsPage.bookNow')} →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <button 
              onClick={fetchEvents}
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              {t('eventsPage.loadMore')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;