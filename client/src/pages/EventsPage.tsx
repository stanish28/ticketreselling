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
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Events</h1>
          <p className="text-xl text-gray-600">Discover amazing events happening in your area</p>
        </div>

        <div className="bg-[#F5F5DC] rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                name="searchTerm"
                placeholder="Search events..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-lg placeholder-gray-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-6 w-6 text-gray-400" />
            </div>
            <select
              name="selectedCategory"
              value={filters.selectedCategory}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-lg"
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
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-lg"
            />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-lg"
            />
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-lg placeholder-gray-500"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent text-lg placeholder-gray-500"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl shadow-md text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#E55A2B] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-6 py-3 rounded-xl text-lg font-bold text-[#FF6B35] border-2 border-[#FF6B35] bg-white hover:bg-[#FF6B35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
            >
              <XMarkIcon className="h-6 w-6 mr-2" />
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-[#F5F5DC] rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-xl transition-transform duration-200 flex flex-col border border-gray-200"
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover border-b border-gray-200"
                  />
                )}
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-[#FF6B35] text-white uppercase tracking-wide">
                      {event.category}
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      {event._count?.tickets || 0} tickets
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <CalendarIcon className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-lg">{format(new Date(event.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 font-semibold">
                    <MapPinIcon className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-lg">{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TicketIcon className="w-5 h-5 text-[#FF6B35]" />
                    <span className="text-[#FF6B35] font-bold text-xl">
                      {event.tickets && event.tickets.length > 0
                        ? `₹${Math.min(...event.tickets.map(t => t.price))}`
                        : 'See tickets'}
                    </span>
                  </div>
                  <Link
                    to={`/events/${event.id}`}
                    className="mt-4 bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all text-center text-lg"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No events found</h2>
            <p className="text-xl text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage; 