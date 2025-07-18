import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketsAPI } from '../services/api.ts';
import { Ticket } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, MapPinIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    listingType: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async (newFilters = filters) => {
    setLoading(true);
    try {
      const params: any = { 
        limit: 50,
        search: newFilters.searchTerm,
        listingType: newFilters.listingType,
        minPrice: newFilters.minPrice,
        maxPrice: newFilters.maxPrice
      };

      const response = await ticketsAPI.getAll(params);
      if (response.success && response.data) {
        setTickets(response.data.tickets || []);
      } else {
        setTickets([]);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchTickets();
  };
  
  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      listingType: '',
      minPrice: '',
      maxPrice: ''
    };
    setFilters(clearedFilters);
    fetchTickets(clearedFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tickets</h1>
          <p className="text-lg text-gray-600">Find the perfect tickets for your next event</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                name="searchTerm"
                placeholder="Search by event, venue..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <select
              name="listingType"
              value={filters.listingType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="DIRECT_SALE">Direct Sale</option>
              <option value="AUCTION">Auction</option>
            </select>

            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSearch}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search
            </button>
            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
        ) : tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {ticket.event?.image && (
                  <img
                    src={ticket.event.image}
                    alt={ticket.event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                    {ticket.event?.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {ticket.event && format(new Date(ticket.event.date), 'MMM dd, yyyy - h:mm a')}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {ticket.event?.venue}
                    </div>
                    <p className="text-lg font-bold text-blue-600">₹{ticket.price.toFixed(2)}</p>
                  </div>
                  
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <MagnifyingGlassIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage; 