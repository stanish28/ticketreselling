import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api.ts';
import { Event } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { 
  CalendarIcon, 
  MapPinIcon, 
  TicketIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  FunnelIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import toast from 'react-hot-toast';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  // const [stats, setStats] = useState({
  //   totalEvents: 0,
  //   upcomingEvents: 0,
  //   featuredEvents: 0
  // });

  const fetchEvents = useCallback(async (newFilters = filters) => {
    setLoading(true);
    try {
      const params: any = { 
        limit: 50,
        search: newFilters.searchTerm,
        category: newFilters.selectedCategory,
        startDate: newFilters.startDate,
        endDate: newFilters.endDate,
        minPrice: newFilters.minPrice,
        maxPrice: newFilters.maxPrice
      };

      const response = await eventsAPI.getAll(params);
      if (response.success && response.data) {
        const eventsData = response.data.events || [];
        setEvents(eventsData);
        
        // Calculate stats
        // const now = new Date();
        // const upcomingEvents = eventsData.filter(event => new Date(event.date) > now).length;
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [fetchEvents]);

  const fetchCategories = async () => {
    try {
      const response = await eventsAPI.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchEvents();
  };
  
  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      selectedCategory: '',
      startDate: '',
      endDate: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(clearedFilters);
    fetchEvents(clearedFilters);
  };

  const getDateBadge = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) {
      return { text: 'TODAY', color: 'bg-red-500', icon: FireIcon };
    } else if (isTomorrow(eventDate)) {
      return { text: 'TOMORROW', color: 'bg-orange-500', icon: ClockIcon };
    } else if (isThisWeek(eventDate)) {
      return { text: 'THIS WEEK', color: 'bg-blue-500', icon: SparklesIcon };
    }
    return null;
  };

  const getSortedEvents = () => {
    const sortedEvents = [...events];
    switch (sortBy) {
      case 'date':
        return sortedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'price':
        return sortedEvents.sort((a, b) => {
          const aPrice = a.tickets && a.tickets.length > 0 ? Math.min(...a.tickets.map(t => t.price)) : 0;
          const bPrice = b.tickets && b.tickets.length > 0 ? Math.min(...b.tickets.map(t => t.price)) : 0;
          return aPrice - bPrice;
        });
      case 'name':
        return sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sortedEvents;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5E7D6] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg tracking-wide">
            <span className="animate-pulse">🎟️</span>
            Discover Amazing Events
            <span className="animate-pulse">🎟️</span>
          </div>
          <h1 className="text-6xl font-bold text-[#222] mb-4 bg-gradient-to-r from-[#222] via-[#D6A77A] to-[#FF6B35] bg-clip-text text-transparent">
            Events
          </h1>
          <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
            Discover amazing events happening in your area. From concerts to sports, find your next unforgettable experience.
          </p>
        </div>



        {/* Enhanced Search and Filter Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#E5E5E5] p-4 sm:p-8 mb-8">
          {/* Quick Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
            {/* Search Input - Full width on mobile */}
            <div className="relative flex-1">
              <input
                type="text"
                name="searchTerm"
                placeholder="Search events, artists, venues..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 bg-[#F8F8F8] text-[#222] border border-[#E5E5E5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-lg placeholder-[#6B6B6B] transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-[#6B6B6B]" />
            </div>
            
            {/* Filter Button - Hidden on mobile, visible on desktop */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden sm:flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
            </button>
            
            {/* Search Button - Full width on mobile, compact on desktop */}
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF6B35] text-white rounded-2xl font-bold hover:bg-[#E55A2B] transition-all shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </div>
          
          {/* Mobile Filter Toggle - Only visible on mobile */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white rounded-2xl font-semibold hover:shadow-lg transition-all"
            >
              <FunnelIcon className="w-5 h-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-[#E5E5E5] pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#222] mb-2">Category</label>
                  <select
                    name="selectedCategory"
                    value={filters.selectedCategory}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-[#F8F8F8] text-[#222] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#222] mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-[#F8F8F8] text-[#222] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#222] mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-[#F8F8F8] text-[#222] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#222] mb-2">Min Price (₹)</label>
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-[#F8F8F8] text-[#222] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent placeholder-[#6B6B6B]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#222] mb-2">Max Price (₹)</label>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="10000"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 bg-[#F8F8F8] text-[#222] border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent placeholder-[#6B6B6B]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-6 py-3 text-[#FF6B35] border-2 border-[#FF6B35] rounded-xl font-semibold hover:bg-[#FF6B35] hover:text-white transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-[#6B6B6B] font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            >
              <option value="date">Date</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#FF6B35] text-white' : 'bg-white text-[#6B6B6B] border border-[#E5E5E5]'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#FF6B35] text-white' : 'bg-white text-[#6B6B6B] border border-[#E5E5E5]'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : getSortedEvents().length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
            {getSortedEvents().map((event) => {
              const dateBadge = getDateBadge(event.date);
              const minPrice = event.tickets && event.tickets.length > 0 ? Math.min(...event.tickets.map(t => t.price)) : 0;
              
              return viewMode === 'grid' ? (
                // Grid View
                <div
                  key={event.id}
                  className="group bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-[#E5E5E5] relative"
                >
                  {/* Date Badge */}
                  {dateBadge && (
                    <div className={`absolute top-4 left-4 z-10 ${dateBadge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                      <dateBadge.icon className="w-3 h-3" />
                      {dateBadge.text}
                    </div>
                  )}
                  
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-[#D6A77A] to-[#FF6B35] flex items-center justify-center">
                        <TicketIcon className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-4">
                    {/* Category and Tickets */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white uppercase tracking-wide">
                        {event.category}
                      </span>
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        (event._count?.tickets || 0) > 0 
                          ? 'text-[#6B6B6B] bg-[#F5E7D6]' 
                          : 'text-red-600 bg-red-100'
                      }`}>
                        {(event._count?.tickets || 0) > 0 
                          ? `${event._count?.tickets || 0} tickets` 
                          : 'Sold Out!'
                        }
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold text-[#222] group-hover:text-[#D6A77A] transition-colors duration-300 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    {/* Date and Venue */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-[#6B6B6B]">
                        <CalendarIcon className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                        <span className="font-semibold">{format(new Date(event.date), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[#6B6B6B]">
                        <MapPinIcon className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                        <span className="font-semibold">{event.venue}</span>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 pt-2">
                      <TicketIcon className="w-5 h-5 text-[#FF6B35]" />
                      <span className={`font-bold text-2xl ${
                        (event._count?.tickets || 0) > 0 
                          ? 'text-[#FF6B35]' 
                          : 'text-red-500'
                      }`}>
                        {(event._count?.tickets || 0) > 0 
                          ? (minPrice > 0 ? `₹${minPrice.toLocaleString()}` : 'Grab Your Spot! 🎟️')
                          : 'Sold Out!'
                        }
                      </span>
                    </div>
                    
                    {/* CTA Button */}
                    <Link
                      to={`/events/${event.id}`}
                      className="mt-4 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#D6A77A] text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center text-lg group-hover:scale-105"
                    >
                      View Event
                    </Link>
                  </div>
                </div>
              ) : (
                // List View
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#E5E5E5]"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative md:w-64 md:h-48 overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-48 md:h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 md:h-full bg-gradient-to-br from-[#D6A77A] to-[#FF6B35] flex items-center justify-center">
                          <TicketIcon className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                      {dateBadge && (
                        <div className={`absolute top-4 left-4 ${dateBadge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                          <dateBadge.icon className="w-3 h-3" />
                          {dateBadge.text}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div className="space-y-4">
                                                 <div className="flex items-center justify-between">
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white uppercase tracking-wide">
                             {event.category}
                           </span>
                           <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                             (event._count?.tickets || 0) > 0 
                               ? 'text-[#6B6B6B] bg-[#F5E7D6]' 
                               : 'text-red-600 bg-red-100'
                           }`}>
                             {(event._count?.tickets || 0) > 0 
                               ? `${event._count?.tickets || 0} tickets` 
                               : 'Sold Out!'
                             }
                           </span>
                         </div>
                        
                        <h3 className="text-2xl font-bold text-[#222] group-hover:text-[#D6A77A] transition-colors duration-300">
                          {event.title}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 text-[#6B6B6B]">
                            <CalendarIcon className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                            <span className="font-semibold">{format(new Date(event.date), 'PPP')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[#6B6B6B]">
                            <MapPinIcon className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                            <span className="font-semibold">{event.venue}</span>
                          </div>
                        </div>
                      </div>
                      
                                              <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
                          <div className="flex items-center gap-2">
                            <TicketIcon className="w-5 h-5 text-[#FF6B35]" />
                                                       <span className={`font-bold text-2xl ${
                             (event._count?.tickets || 0) > 0 
                               ? 'text-[#FF6B35]' 
                               : 'text-red-500'
                           }`}>
                             {(event._count?.tickets || 0) > 0 
                               ? (minPrice > 0 ? `₹${minPrice.toLocaleString()}` : 'Grab Your Spot! 🎟️')
                               : 'Sold Out!'
                             }
                           </span>
                          </div>
                        <Link
                          to={`/events/${event.id}`}
                          className="bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] hover:from-[#FF6B35] hover:to-[#D6A77A] text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          View Event
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl border border-[#E5E5E5] p-12 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-[#D6A77A] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6">
                <TicketIcon className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#222] mb-4">No events found</h2>
              <p className="text-xl text-[#6B6B6B] mb-6">Try adjusting your filters or check back later for new events.</p>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg transition-all"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage; 