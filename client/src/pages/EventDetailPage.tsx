import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, MapPinIcon, UsersIcon, TicketIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Ticket {
  id: string;
  price: number;
  section?: string;
  row?: string;
  seat?: string;
  status: string;
  listingType: string;
  endTime?: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  _count: {
    bids: number;
  };
}

interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  date: string;
  category: string;
  capacity: number;
  image?: string;
  tickets: Ticket[];
  _count: {
    tickets: number;
  };
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'direct' | 'auction'>('all');

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/events/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const data = await response.json();
      setEvent(data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTickets = () => {
    if (!event) return [];
    
    switch (filter) {
      case 'direct':
        return event.tickets.filter(ticket => ticket.listingType === 'DIRECT_SALE');
      case 'auction':
        return event.tickets.filter(ticket => ticket.listingType === 'AUCTION');
      default:
        return event.tickets;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'SOLD':
        return 'bg-red-100 text-red-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'AUCTION':
        return 'bg-purple-100 text-purple-800';
      case 'DIRECT_SALE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
          <Link
            to="/events"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const filteredTickets = getFilteredTickets();
  const availableTickets = filteredTickets.filter(ticket => ticket.status === 'AVAILABLE');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Event Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          {event.image && (
            <div className="h-64 bg-gray-200">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getListingTypeColor(event.category)}`}>
                {event.category}
              </span>
              {user?.role === 'ADMIN' && (
                <Link
                  to={`/admin/events/${event.id}/tickets`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Tickets
                </Link>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
            <p className="text-lg text-gray-600 mb-6">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-600">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy - h:mm a')}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Venue</p>
                  <p className="text-sm text-gray-600">{event.venue}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Capacity</p>
                  <p className="text-sm text-gray-600">{event.capacity} people</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Available Tickets</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All ({availableTickets.length})
                </button>
                <button
                  onClick={() => setFilter('direct')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'direct' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Direct Sale ({availableTickets.filter(t => t.listingType === 'DIRECT_SALE').length})
                </button>
                <button
                  onClick={() => setFilter('auction')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'auction' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Auctions ({availableTickets.filter(t => t.listingType === 'AUCTION').length})
                </button>
              </div>
            </div>
          </div>

          {availableTickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'There are no tickets available for this event at the moment.'
                  : `There are no ${filter === 'direct' ? 'direct sale' : 'auction'} tickets available.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {availableTickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getListingTypeColor(ticket.listingType)}`}>
                        {ticket.listingType === 'AUCTION' ? 'Auction' : 'Direct Sale'}
                      </span>
                      {ticket.seller.role !== 'ADMIN' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Resell
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Price</span>
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-lg font-bold text-gray-900">
                          ₹{ticket.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {ticket.section && (
                      <div className="text-sm text-gray-600">
                        Section {ticket.section}
                        {ticket.row && ` • Row ${ticket.row}`}
                        {ticket.seat && ` • Seat ${ticket.seat}`}
                      </div>
                    )}
                    
                    {ticket.listingType === 'AUCTION' && ticket.endTime && (
                      <div className="flex items-center mt-2 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Ends {format(new Date(ticket.endTime), 'MMM dd, h:mm a')}
                      </div>
                    )}
                    
                    {ticket._count.bids > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        {ticket._count.bids} bid{ticket._count.bids !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {ticket.listingType === 'AUCTION' ? (
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="flex-1 text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        View Auction
                      </Link>
                    ) : (
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="flex-1 text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Buy Now
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage; 