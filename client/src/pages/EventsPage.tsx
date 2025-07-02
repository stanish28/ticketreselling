import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api.ts';
import { Event } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, MapPinIcon, TicketIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedCategory: '',
    startDate: '',
    endDate: '',
    minPrice: '',
    maxPrice: ''
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchEvents = async (newFilters = filters) => {
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
        setEvents(response.data.events || []);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#231651] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-neon-pink mb-2 uppercase tracking-tight">Events</h1>
          <p className="text-lg text-white font-medium">Discover amazing events happening in your area</p>
        </div>

        <div className="bg-black rounded-2xl shadow-xl p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                name="searchTerm"
                placeholder="Search events..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-neon-blue" />
            </div>
            <select
              name="selectedCategory"
              value={filters.selectedCategory}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold"
            />
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 rounded-lg shadow-md text-sm font-bold text-white bg-neon-blue hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] focus:outline-none focus:ring-2 focus:ring-neon-blue transition-all"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-neon-pink border border-neon-pink bg-black hover:bg-[#231651] hover:text-white focus:outline-none focus:ring-2 focus:ring-neon-pink transition-all"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-black rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-[0_0_24px_4px_#1E90FF,0_0_32px_8px_#FF1EC6] transition-transform duration-200 flex flex-col"
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-52 object-cover border-b-4 border-transparent hover:border-neon-pink transition-all duration-200"
                  />
                )}
                <div className="p-6 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1E90FF22] text-neon-blue uppercase tracking-wide">
                      {event.category}
                    </span>
                    <span className="text-sm text-neon-pink font-bold">
                      {event._count?.tickets || 0} tickets
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2 truncate">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-neon-blue font-bold">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{format(new Date(event.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <MapPinIcon className="w-5 h-5 text-neon-pink" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TicketIcon className="w-5 h-5 text-neon-pink" />
                    <span className="text-neon-pink font-bold text-lg">
                      {event.tickets && event.tickets.length > 0
                        ? `₹${Math.min(...event.tickets.map(t => t.price))}`
                        : 'See tickets'}
                    </span>
                  </div>
                  <Link
                    to={`/events/${event.id}`}
                    className="mt-4 bg-neon-blue hover:bg-neon-pink text-white font-bold py-2 px-6 rounded-full shadow-md hover:shadow-[0_0_16px_2px_#FF1EC6] transition-all text-center"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-neon-pink mb-4">No events found</h2>
            <p className="text-white">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage; 