import React, { useState } from 'react';
import { Search, Calendar, MapPin, Filter, ChevronDown, Grid, List, Star, Users } from 'lucide-react';

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDate, setSelectedDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const categories = ['All', 'Sports', 'Music', 'Theater', 'Education', 'Movies'];

  const events = [
    {
      id: 1,
      title: "Rock Concert 2024",
      date: "March 15, 2024",
      time: "20:00",
      location: "New York",
      venue: "Stadium Arena",
      price: 45,
      category: "Music",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop",
      rating: 4.8,
      attendees: 2500,
      description: "Experience the best rock music live!"
    },
    {
      id: 2,
      title: "Football Championship",
      date: "March 20, 2024",
      time: "18:00",
      location: "Los Angeles",
      venue: "National Stadium",
      price: 30,
      category: "Sports",
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop",
      rating: 4.5,
      attendees: 5000,
      description: "Championship final match!"
    },
    {
      id: 3,
      title: "Tech Conference 2024",
      date: "March 25, 2024",
      time: "09:00",
      location: "Chicago",
      venue: "Convention Center",
      price: 120,
      category: "Education",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      rating: 4.7,
      attendees: 800,
      description: "Latest trends in technology"
    },
    {
      id: 4,
      title: "Broadway Musical",
      date: "April 1, 2024",
      time: "19:30",
      location: "New York",
      venue: "City Theater",
      price: 75,
      category: "Theater",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      rating: 4.9,
      attendees: 1200,
      description: "Award-winning Broadway show"
    },
    {
      id: 5,
      title: "Movie Premiere",
      date: "April 5, 2024",
      time: "21:00",
      location: "Los Angeles",
      venue: "Cinema Complex",
      price: 25,
      category: "Movies",
      image: "https://images.unsplash.com/photo-1489599511777-9c0c0c41b2c4?w=400&h=300&fit=crop",
      rating: 4.3,
      attendees: 300,
      description: "Exclusive movie premiere"
    },
    {
      id: 6,
      title: "Jazz Festival",
      date: "April 10, 2024",
      time: "19:00",
      location: "Chicago",
      venue: "Park Amphitheater",
      price: 60,
      category: "Music",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
      rating: 4.6,
      attendees: 1500,
      description: "Smooth jazz under the stars"
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesCategory = activeFilter === 'All' || event.category === activeFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'All Locations' || event.location === selectedLocation;
    
    return matchesCategory && matchesSearch && matchesLocation;
  });

  const getCategoryBadgeColor = (category) => {
    const colors = {
      'Music': 'bg-purple-100 text-purple-800',
      'Sports': 'bg-red-100 text-red-800',
      'Theater': 'bg-green-100 text-green-800',
      'Education': 'bg-blue-100 text-blue-800',
      'Movies': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
          <p className="text-gray-600">Find and book tickets for amazing events near you</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for events..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  <option>All Locations</option>
                  <option>New York</option>
                  <option>Los Angeles</option>
                  <option>Chicago</option>
                  <option>Houston</option>
                  <option>Philadelphia</option>
                  <option>Phoenix</option>
                  <option>San Francisco</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>
              
              <input
                type="date"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Select date"
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
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredEvents.length} events
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

        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              onClick={() => window.location.href = `/events/${event.id}`}
              className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1 cursor-pointer ${viewMode === 'list' ? 'flex' : ''}`}
            >
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                <img
                  src={event.image}
                  alt={event.title}
                  className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                    viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                  }`}
                />
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  ${event.price}
                </div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getCategoryBadgeColor(event.category)}`}>
                    {event.category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" />
                    {event.rating}
                  </div>
                  <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {event.attendees}
                  </div>
                </div>
              </div>
              
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="text-sm">{event.date} at {event.time}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-sm">{event.venue}, {event.location}</span>
                </div>
                
                <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                  <button className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl ${
                    viewMode === 'list' ? '' : 'w-full'
                  }`}>
                    Book Now →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-md hover:shadow-lg">
            Load More Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;