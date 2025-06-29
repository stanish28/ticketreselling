import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, TicketIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

interface Ticket {
  id: string;
  price: number;
  section?: string;
  row?: string;
  seat?: string;
  status: string;
  purchasedAt: string;
  event: {
    id: string;
    title: string;
    venue: string;
    date: string;
    image?: string;
    category: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  qrCode?: string;
  listingType?: 'DIRECT_SALE' | 'AUCTION';
}

const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [resellModalOpen, setResellModalOpen] = useState(false);
  const [resellTicket, setResellTicket] = useState<Ticket | null>(null);
  const [resellPrice, setResellPrice] = useState('');
  const [resellType, setResellType] = useState<'DIRECT_SALE' | 'AUCTION'>('DIRECT_SALE');
  const [resellLoading, setResellLoading] = useState(false);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tickets/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTickets = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return tickets.filter(ticket => new Date(ticket.event.date) > now);
      case 'past':
        return tickets.filter(ticket => new Date(ticket.event.date) <= now);
      default:
        return tickets;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOLD':
        return 'bg-green-100 text-green-800';
      case 'RESERVED':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    
    if (eventDateObj > now) {
      const diffTime = eventDateObj.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return { status: 'Tomorrow', color: 'text-blue-600' };
      } else if (diffDays <= 7) {
        return { status: `In ${diffDays} days`, color: 'text-blue-600' };
      } else {
        return { status: 'Upcoming', color: 'text-green-600' };
      }
    } else {
      return { status: 'Past', color: 'text-gray-500' };
    }
  };

  const isEventWithin24Hours = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    const diffTime = eventDateObj.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    // Event is within 24 hours if it's less than 24 hours away and not past
    return diffHours <= 24 && diffHours >= 0;
  };

  const getQRCodeMessage = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    const diffTime = eventDateObj.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return 'Event has passed';
    } else if (diffHours <= 24) {
      return 'Show QR Code';
    } else {
      const diffDays = Math.ceil(diffHours / 24);
      return `QR available in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  };

  const openResellModal = (ticket: Ticket) => {
    setResellTicket(ticket);
    setResellPrice(ticket.price.toString());
    setResellType(ticket.listingType as 'DIRECT_SALE' | 'AUCTION');
    setResellModalOpen(true);
  };

  const closeResellModal = () => {
    setResellModalOpen(false);
    setResellTicket(null);
    setResellPrice('');
    setResellType('DIRECT_SALE');
  };

  const handleResell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellTicket) return;
    setResellLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/tickets/${resellTicket.id}/resell`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          price: parseFloat(resellPrice),
          listingType: resellType,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to relist ticket');
      }
      toast.success('Ticket relisted for sale!');
      closeResellModal();
      fetchMyTickets();
      if ((window as any).refreshNavbarTicketCount) {
        (window as any).refreshNavbarTicketCount();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to relist ticket');
    } finally {
      setResellLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredTickets = getFilteredTickets();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
          <p className="mt-2 text-gray-600">
            View and manage your purchased tickets
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Upcoming ({tickets.filter(t => new Date(t.event.date) > new Date()).length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Past ({tickets.filter(t => new Date(t.event.date) <= new Date()).length})
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You haven't purchased any tickets yet."
                : `You don't have any ${filter} tickets.`
              }
            </p>
            <div className="mt-6">
              <Link
                to="/events"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              const eventStatus = getEventStatus(ticket.event.date);
              const isPast = new Date(ticket.event.date) <= new Date();
              
              return (
                <div key={ticket.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Event Image */}
                  {ticket.event.image && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={ticket.event.image}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Ticket Info */}
                  <div className="p-6">
                    {/* Status Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Purchased
                      </span>
                      <span className={`text-xs font-medium ${eventStatus.color}`}>
                        {eventStatus.status}
                      </span>
                    </div>

                    {/* Event Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {ticket.event.title}
                    </h3>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(new Date(ticket.event.date), 'EEEE, MMMM dd, yyyy - h:mm a')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {ticket.event.venue}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TicketIcon className="h-4 w-4 mr-2" />
                        {ticket.section && `Section ${ticket.section}`}
                        {ticket.row && ` • Row ${ticket.row}`}
                        {ticket.seat && ` • Seat ${ticket.seat}`}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        Paid ${ticket.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Purchase Date */}
                    <div className="text-xs text-gray-500 mb-4">
                      Purchased on {format(new Date(ticket.purchasedAt), 'MMM dd, yyyy')}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {!isPast && (
                        <button
                          onClick={() => {
                            if (isEventWithin24Hours(ticket.event.date)) {
                              // Show QR code when event is within 24 hours
                              alert('QR Code: ' + ticket.qrCode);
                            } else {
                              // Show message when event is more than 24 hours away
                              const message = getQRCodeMessage(ticket.event.date);
                              alert(message);
                            }
                          }}
                          className={`flex-1 inline-flex items-center justify-center px-3 py-2 border rounded-md text-sm font-medium ${
                            isEventWithin24Hours(ticket.event.date)
                              ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              : 'border-gray-200 text-gray-500 bg-gray-50 cursor-not-allowed'
                          }`}
                        >
                          <QrCodeIcon className="h-4 w-4 mr-1" />
                          {getQRCodeMessage(ticket.event.date)}
                        </button>
                      )}
                      <button
                        onClick={() => openResellModal(ticket)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-yellow-400 text-yellow-700 bg-yellow-100 rounded-md text-sm font-medium hover:bg-yellow-200"
                      >
                        Sell
                      </button>
                      <Link
                        to={`/events/${ticket.event.id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resell Modal */}
      <Transition.Root show={resellModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeResellModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Resell Ticket
                  </Dialog.Title>
                  {resellTicket && (
                    <form onSubmit={handleResell} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Event</label>
                        <div className="mt-1 text-gray-900 font-semibold">{resellTicket.event.title}</div>
                        <div className="text-xs text-gray-500">{resellTicket.event.venue} • {format(new Date(resellTicket.event.date), 'MMM dd, yyyy')}</div>
                      </div>
                      <div className="flex space-x-2">
                        {resellTicket.section && <div className="text-xs text-gray-600">Section {resellTicket.section}</div>}
                        {resellTicket.row && <div className="text-xs text-gray-600">Row {resellTicket.row}</div>}
                        {resellTicket.seat && <div className="text-xs text-gray-600">Seat {resellTicket.seat}</div>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                        <input
                          type="number"
                          min={1}
                          step={0.01}
                          value={resellPrice}
                          onChange={e => setResellPrice(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Listing Type</label>
                        <select
                          value={resellType}
                          onChange={e => setResellType(e.target.value as 'DIRECT_SALE' | 'AUCTION')}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="DIRECT_SALE">Direct Sale</option>
                          <option value="AUCTION">Auction</option>
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2 mt-6">
                        <button
                          type="button"
                          onClick={closeResellModal}
                          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={resellLoading}
                          className="px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
                        >
                          {resellLoading ? 'Listing...' : 'List for Sale'}
                        </button>
                      </div>
                    </form>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default MyTicketsPage; 