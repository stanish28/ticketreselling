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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] to-[#231651]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredTickets = getFilteredTickets();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#231651] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-neon-pink mb-2 uppercase tracking-tight">My Tickets</h1>
          <p className="text-lg text-white font-medium">View and manage your purchased tickets</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full text-lg font-bold transition-all shadow-md border-2 ${
                filter === 'all'
                  ? 'bg-neon-blue text-white border-neon-blue shadow-[0_0_16px_2px_#1E90FF]'
                  : 'bg-black text-neon-blue border-neon-blue hover:bg-[#231651] hover:text-white'
              }`}
            >
              All ({tickets.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-full text-lg font-bold transition-all shadow-md border-2 ${
                filter === 'upcoming'
                  ? 'bg-neon-blue text-white border-neon-blue shadow-[0_0_16px_2px_#1E90FF]'
                  : 'bg-black text-neon-blue border-neon-blue hover:bg-[#231651] hover:text-white'
              }`}
            >
              Upcoming ({tickets.filter(t => new Date(t.event.date) > new Date()).length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-full text-lg font-bold transition-all shadow-md border-2 ${
                filter === 'past'
                  ? 'bg-neon-blue text-white border-neon-blue shadow-[0_0_16px_2px_#1E90FF]'
                  : 'bg-black text-neon-blue border-neon-blue hover:bg-[#231651] hover:text-white'
              }`}
            >
              Past ({tickets.filter(t => new Date(t.event.date) <= new Date()).length})
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <TicketIcon className="mx-auto h-12 w-12 text-neon-pink" />
            <h3 className="mt-4 text-2xl font-bold text-neon-pink">No tickets found</h3>
            <p className="mt-2 text-lg text-white">
              {filter === 'all' 
                ? "You haven't purchased any tickets yet."
                : `You don't have any ${filter} tickets.`
              }
            </p>
            <div className="mt-8">
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold text-white bg-neon-blue hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] transition-all"
              >
                Browse Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-black rounded-2xl shadow-lg overflow-hidden hover:scale-105 hover:shadow-[0_0_24px_4px_#1E90FF,0_0_32px_8px_#FF1EC6] transition-transform duration-200 flex flex-col"
              >
                {ticket.event.image && (
                  <img
                    src={ticket.event.image}
                    alt={ticket.event.title}
                    className="w-full h-52 object-cover border-b-4 border-transparent hover:border-neon-pink transition-all duration-200"
                  />
                )}
                <div className="p-6 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1E90FF22] text-neon-blue uppercase tracking-wide">
                      {ticket.event.category}
                    </span>
                    <span className="text-sm text-neon-pink font-bold">
                      {ticket.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2 truncate">
                    {ticket.event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-neon-blue font-bold">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{format(new Date(ticket.event.date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <MapPinIcon className="w-5 h-5 text-neon-pink" />
                    <span>{ticket.event.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <TicketIcon className="w-5 h-5 text-neon-pink" />
                    <span className="text-neon-pink font-bold text-lg">
                      ₹{ticket.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white text-sm font-semibold">
                      Purchased: {format(new Date(ticket.purchasedAt), 'PPP p')}
                    </span>
                  </div>
                  {/* QR Code and Resell Button */}
                  <div className="flex items-center gap-4 mt-4">
                    {ticket.qrCode && isEventWithin24Hours(ticket.event.date) ? (
                      <a
                        href={ticket.qrCode}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-neon-blue hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] transition-all"
                      >
                        <QrCodeIcon className="w-5 h-5 mr-2" /> Show QR
                      </a>
                    ) : (
                      <span className="text-neon-blue text-xs font-semibold">
                        {getQRCodeMessage(ticket.event.date)}
                      </span>
                    )}
                    {/* Resell Button */}
                    {ticket.status === 'SOLD' ? null : (
                      <button
                        onClick={() => openResellModal(ticket)}
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-neon-pink hover:bg-neon-blue hover:shadow-[0_0_16px_2px_#1E90FF] transition-all"
                      >
                        Resell
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resell Modal */}
        <Transition show={resellModalOpen} as={React.Fragment}>
          <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={closeResellModal}>
            <div className="flex items-center justify-center min-h-screen px-4">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" />
              </Transition.Child>
              <span className="inline-block align-middle h-screen" aria-hidden="true">&#8203;</span>
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block bg-[#18122B] rounded-2xl p-8 shadow-2xl max-w-md w-full align-middle">
                  <Dialog.Title className="text-2xl font-extrabold text-neon-pink mb-4">Resell Ticket</Dialog.Title>
                  <form onSubmit={handleResell} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-white mb-1">Price (₹)</label>
                      <input
                        type="number"
                        min="1"
                        value={resellPrice}
                        onChange={e => setResellPrice(e.target.value)}
                        className="block w-full px-4 py-3 bg-[#231651] text-white border border-neon-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue font-semibold placeholder-white/60"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white mb-1">Listing Type</label>
                      <select
                        value={resellType}
                        onChange={e => setResellType(e.target.value as 'DIRECT_SALE' | 'AUCTION')}
                        className="block w-full px-4 py-3 bg-[#231651] text-white border border-neon-blue rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue font-semibold"
                      >
                        <option value="DIRECT_SALE">Direct Sale</option>
                        <option value="AUCTION">Auction</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="button"
                        onClick={closeResellModal}
                        className="px-6 py-2 rounded-full text-lg font-bold text-neon-pink border border-neon-pink bg-black hover:bg-[#231651] hover:text-white focus:outline-none focus:ring-2 focus:ring-neon-pink transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resellLoading}
                        className="px-6 py-2 rounded-full text-lg font-bold text-white bg-neon-blue hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] focus:outline-none focus:ring-2 focus:ring-neon-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {resellLoading ? 'Listing...' : 'List Ticket'}
                      </button>
                    </div>
                  </form>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default MyTicketsPage; 