import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, TicketIcon, QrCodeIcon, EyeIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { ticketsAPI, bidsAPI } from '../services/api.ts';
import { Ticket as BaseTicket } from '../types/index.ts';

interface PurchasedTicket extends BaseTicket {
  purchasedAt: string;
  qrCode?: string;
}

interface ListedTicket extends BaseTicket {
  createdAt: string;
  _count?: {
    bids: number;
  };
}

interface Bid {
  id: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  bidder?: {
    id: string;
    name: string;
    email: string;
  };
}

const MyTicketsPage: React.FC = () => {
  // const { user: authUser } = useAuth();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [listings, setListings] = useState<ListedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [activeTab, setActiveTab] = useState<'purchased' | 'listed'>('purchased');
  const [resellModalOpen, setResellModalOpen] = useState(false);
  const [resellTicket, setResellTicket] = useState<PurchasedTicket | null>(null);
  const [resellPrice, setResellPrice] = useState('');
  const [resellType, setResellType] = useState<'DIRECT_SALE' | 'AUCTION'>('DIRECT_SALE');
  const [resellLoading, setResellLoading] = useState(false);
  
  // Bid viewing state
  const [selectedTicketBids, setSelectedTicketBids] = useState<Bid[]>([]);
  const [isBidsModalOpen, setIsBidsModalOpen] = useState(false);
  const [processingOffer, setProcessingOffer] = useState<string | null>(null);
  const [cancellingListing, setCancellingListing] = useState<string | null>(null);
  const [cancelConfirmation, setCancelConfirmation] = useState<{ ticketId: string; eventTitle: string } | null>(null);

  useEffect(() => {
    fetchMyTickets();
    fetchMyListings();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const response = await ticketsAPI.getMyTickets();
      if (response.success) {
        setTickets((response.data || []) as PurchasedTicket[]);
      } else {
        toast.error(response.message || 'Failed to fetch tickets');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      const response = await ticketsAPI.getMyListings();
      if (response.success) {
        setListings(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch listings');
      }
    } catch (error) {
      toast.error('An error occurred while fetching your listings.');
    } finally {
      setListingsLoading(false);
    }
  };

  const handleViewBids = async (ticketId: string) => {
    try {
      const response = await bidsAPI.getTicketBids(ticketId);
      if (response.success) {
        setSelectedTicketBids(response.data || []);
        setIsBidsModalOpen(true);
      } else {
        toast.error(response.message || 'Failed to fetch bids');
      }
    } catch (error) {
      toast.error('An error occurred while fetching bids.');
    }
  };

  const handleAcceptOffer = async (bidId: string) => {
    setProcessingOffer(bidId);
    try {
      const response = await bidsAPI.acceptOffer(bidId);
      if (response.success) {
        toast.success('Offer accepted successfully! The buyer has been notified and can now view the ticket in their "My Tickets" section.');
        setIsBidsModalOpen(false);
        fetchMyListings(); // Refresh listings
      } else {
        toast.error(response.message || 'Failed to accept offer');
      }
    } catch (error) {
      toast.error('An error occurred while accepting the offer.');
    } finally {
      setProcessingOffer(null);
    }
  };

  const handleRejectOffer = async (bidId: string) => {
    setProcessingOffer(bidId);
    try {
      const response = await bidsAPI.rejectOffer(bidId);
      if (response.success) {
        toast.success('Offer rejected successfully!');
        // Update the local state to reflect the change
        setSelectedTicketBids(prev => 
          prev.map(bid => 
            bid.id === bidId ? { ...bid, status: 'REJECTED' as const } : bid
          )
        );
      } else {
        toast.error(response.message || 'Failed to reject offer');
      }
    } catch (error) {
      toast.error('An error occurred while rejecting the offer.');
    } finally {
      setProcessingOffer(null);
    }
  };

  const handleCancelListing = async (ticketId: string) => {
    setCancellingListing(ticketId);
    try {
      // Note: This endpoint might not exist in the API service yet
      // For now, we'll keep the fetch call but update the URL
      const response = await fetch(`https://ticketreselling-production.up.railway.app/api/tickets/${ticketId}/cancel-listing`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Listing cancelled successfully!');
        setCancelConfirmation(null);
        fetchMyListings(); // Refresh listings
      } else {
        toast.error(data.error || 'Failed to cancel listing');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the listing.');
    } finally {
      setCancellingListing(null);
    }
  };

  const getFilteredTickets = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return tickets.filter(ticket => ticket.event && new Date(ticket.event.date) > now);
      case 'past':
        return tickets.filter(ticket => ticket.event && new Date(ticket.event.date) <= now);
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

  const getDisplayStatus = (status: string) => {
    switch (status) {
      case 'SOLD':
        return 'Sold';
      case 'RESERVED':
        return 'Reserved';
      case 'EXPIRED':
        return 'Expired';
      default:
        return 'Available';
    }
  };

  const getEventStatus = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    const timeDiff = eventDateObj.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'Event passed', color: 'text-red-600' };
    } else if (daysDiff === 0) {
      return { status: 'Today', color: 'text-orange-600' };
    } else if (daysDiff === 1) {
      return { status: 'Tomorrow', color: 'text-orange-600' };
    } else if (daysDiff <= 7) {
      return { status: `In ${daysDiff} days`, color: 'text-yellow-600' };
    } else {
      return { status: `In ${daysDiff} days`, color: 'text-green-600' };
    }
  };

  const isEventWithin24Hours = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    const timeDiff = eventDateObj.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return hoursDiff <= 24 && hoursDiff >= 0;
  };

  const getQRCodeMessage = (eventDate: string) => {
    const now = new Date();
    const eventDateObj = new Date(eventDate);
    const timeDiff = eventDateObj.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);

    if (hoursDiff < 0) {
      return 'Event has passed';
    } else if (hoursDiff < 24) {
      return 'QR Code will be available within 24 hours of the event';
    } else {
      const daysDiff = Math.ceil(hoursDiff / 24);
      return `QR Code will be available in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`;
    }
  };

  const openResellModal = (ticket: PurchasedTicket) => {
    setResellTicket(ticket);
    setResellPrice(ticket.price.toString());
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
      // Note: This endpoint might not exist in the API service yet
      // For now, we'll keep the fetch call but update the URL
      const response = await fetch(`https://ticketreselling-production.up.railway.app/api/tickets/${resellTicket.id}/resell`, {
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

      toast.success('Ticket listed successfully!');
      closeResellModal();
      fetchMyTickets();
      fetchMyListings();
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredTickets = getFilteredTickets();

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">My Tickets</h1>
          <p className="text-xl text-gray-600">Manage your purchased tickets and listings</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('purchased')}
                className={`py-3 px-1 border-b-2 font-bold text-lg transition-all ${
                  activeTab === 'purchased'
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Purchased Tickets ({filteredTickets.length})
              </button>
              <button
                onClick={() => setActiveTab('listed')}
                className={`py-3 px-1 border-b-2 font-bold text-lg transition-all ${
                  activeTab === 'listed'
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Listed Tickets ({listings.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Purchased Tickets Tab */}
        {activeTab === 'purchased' && (
          <>
            {/* Filter Buttons */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#FF6B35]'
                }`}
              >
                All ({filteredTickets.length})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
                  filter === 'upcoming'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#FF6B35]'
                }`}
              >
                Upcoming ({filteredTickets.filter(t => t.event && new Date(t.event.date) > new Date()).length})
              </button>
              <button
                onClick={() => setFilter('past')}
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${
                  filter === 'past'
                    ? 'bg-[#FF6B35] text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#FF6B35]'
                }`}
              >
                Past ({filteredTickets.filter(t => t.event && new Date(t.event.date) <= new Date()).length})
              </button>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 bg-[#F5F5DC] rounded-2xl border border-gray-200">
                <TicketIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-lg text-gray-600">
                  {filter === 'all' 
                    ? "You haven't purchased any tickets yet."
                    : `No ${filter} tickets found.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-[#F5F5DC] rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                        {getDisplayStatus(ticket.status)}
                      </span>
                      <div className="text-sm text-gray-600">
                        {ticket.event && getEventStatus(ticket.event.date).status}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {ticket.event?.title || 'Unknown Event'}
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-lg text-gray-700">
                        <MapPinIcon className="w-5 h-5 mr-3 text-[#FF6B35]" />
                        {ticket.event?.venue || 'Venue not specified'}
                      </div>
                      <div className="flex items-center text-lg text-gray-700">
                        <CalendarIcon className="w-5 h-5 mr-3 text-[#FF6B35]" />
                        {ticket.event?.date ? format(new Date(ticket.event.date), 'MMM dd, yyyy') : 'Date not specified'}
                      </div>
                      <div className="flex items-center text-lg text-gray-700">
                        <CurrencyDollarIcon className="w-5 h-5 mr-3 text-[#FF6B35]" />
                        <span className="font-bold text-[#FF6B35]">₹{ticket.price.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Seat Details Box */}
                    {ticket.ticketType === 'STANDING' && ticket.section && (
                      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Section</div>
                        <div className="text-gray-900 font-semibold text-lg">
                          Section {ticket.section}
                        </div>
                      </div>
                    )}
                    {(!ticket.ticketType || ticket.ticketType === 'SEATED') && ticket.section && ticket.row && ticket.seat && (
                      <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">Seat Details</div>
                        <div className="text-gray-900 font-semibold text-lg">
                          Section {ticket.section} • Row {ticket.row} • Seat {ticket.seat}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col space-y-3">
                      {ticket.qrCode && ticket.event && isEventWithin24Hours(ticket.event.date) ? (
                        <a
                          href={ticket.qrCode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center px-4 py-3 rounded-xl text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#E55A2B] transition-all border-2 border-[#FF6B35] hover:border-[#E55A2B]"
                        >
                          <QrCodeIcon className="w-5 h-5 mr-2" /> Show QR Code
                        </a>
                      ) : (
                        <span className="text-center text-[#FF6B35] text-sm font-semibold px-4 py-3">
                          {ticket.event ? getQRCodeMessage(ticket.event.date) : 'QR Code unavailable'}
                        </span>
                      )}

                      {/* Sell Ticket Button */}
                      <button
                        onClick={() => openResellModal(ticket)}
                        className="w-full inline-flex items-center justify-center px-4 py-3 rounded-xl text-lg font-bold text-[#FF6B35] bg-white hover:bg-gray-50 border-2 border-[#FF6B35] hover:border-[#E55A2B] transition-all"
                      >
                        <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                        Sell Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Listed Tickets Tab */}
        {activeTab === 'listed' && (
          <>
            {listingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-[#F5F5DC] rounded-2xl border border-gray-200">
                <TicketIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No active listings</h3>
                <p className="text-lg text-gray-600">
                  You haven't listed any tickets for sale yet.
                </p>
              </div>
            ) : (
              <div className="bg-[#F5F5DC] rounded-2xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {listings.map((ticket) => (
                    <div key={ticket.id} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Link to={`/tickets/${ticket.id}`} className="text-xl font-bold text-gray-900 hover:text-[#FF6B35] transition-colors">
                          {ticket.event?.title || 'Event details not available'}
                        </Link>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            ticket.listingType === 'AUCTION' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {ticket.listingType === 'AUCTION' ? 'Auction' : 'Direct Sale'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-lg text-gray-700">
                          <CurrencyDollarIcon className="w-5 h-5 mr-2 text-[#FF6B35]" />
                          <span className="font-bold text-[#FF6B35]">₹{ticket.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center text-lg text-gray-700">
                          <CalendarIcon className="w-5 h-5 mr-2 text-[#FF6B35]" />
                          Listed on {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM dd, yyyy') : 'Unknown date'}
                        </div>
                        <div className="flex items-center text-lg text-gray-700">
                          <TicketIcon className="w-5 h-5 mr-2 text-[#FF6B35]" />
                          {ticket._count?.bids || 0} bids
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {ticket.listingType === 'AUCTION' && (
                          <button 
                            onClick={() => handleViewBids(ticket.id)}
                            className="flex items-center px-4 py-2 rounded-xl text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#E55A2B] transition-all"
                          >
                            <EyeIcon className="w-5 h-5 mr-2" />
                            View Bids ({ticket._count?.bids || 0})
                          </button>
                        )}
                        
                        <button
                          onClick={() => setCancelConfirmation({ ticketId: ticket.id, eventTitle: ticket.event?.title || 'Unknown Event' })}
                          disabled={cancellingListing === ticket.id}
                          className="flex items-center px-4 py-2 rounded-xl text-lg font-bold text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          <TrashIcon className="w-5 h-5 mr-2" />
                          {cancellingListing === ticket.id ? 'Cancelling...' : 'Cancel Listing'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Resell Modal */}
        <Transition show={resellModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={closeResellModal}>
            <div className="flex items-center justify-center min-h-screen px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>
              <span className="inline-block align-middle h-screen" aria-hidden="true">&#8203;</span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block bg-[#F5F5DC] rounded-2xl p-8 shadow-2xl max-w-md w-full align-middle border border-gray-200 relative z-10">
                  <Dialog.Title className="text-3xl font-bold text-gray-900 mb-4">Sell Your Ticket</Dialog.Title>
                  <p className="text-lg text-gray-600 mb-6">Choose how you want to sell your ticket and set your price.</p>
                  
                  <form onSubmit={handleResell} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Price (₹)</label>
                      <input
                        type="number"
                        min="1"
                        value={resellPrice}
                        onChange={e => setResellPrice(e.target.value)}
                        className="block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold placeholder-gray-500 text-lg"
                        placeholder="Enter your asking price"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-3">Selling Method</label>
                      <div className="space-y-3">
                        <label className="flex items-center p-4 bg-white rounded-xl border border-gray-300 hover:border-[#FF6B35] cursor-pointer transition-all">
                          <input
                            type="radio"
                            name="resellType"
                            value="DIRECT_SALE"
                            checked={resellType === 'DIRECT_SALE'}
                            onChange={() => setResellType('DIRECT_SALE')}
                            className="form-radio h-5 w-5 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35] mr-3"
                          />
                          <div>
                            <div className="font-bold text-gray-900">Direct Sale</div>
                            <div className="text-sm text-gray-600">Sell immediately at your set price</div>
                          </div>
                        </label>
                        <label className="flex items-center p-4 bg-white rounded-xl border border-gray-300 hover:border-[#FF6B35] cursor-pointer transition-all">
                          <input
                            type="radio"
                            name="resellType"
                            value="AUCTION"
                            checked={resellType === 'AUCTION'}
                            onChange={() => setResellType('AUCTION')}
                            className="form-radio h-5 w-5 text-[#FF6B35] border-gray-300 focus:ring-[#FF6B35] mr-3"
                          />
                          <div>
                            <div className="font-bold text-gray-900">Auction</div>
                            <div className="text-sm text-gray-600">Let buyers bid and accept the best offer</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="button"
                        onClick={closeResellModal}
                        className="px-6 py-3 rounded-xl text-lg font-bold text-[#FF6B35] border-2 border-[#FF6B35] bg-white hover:bg-[#FF6B35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resellLoading}
                        className="px-6 py-3 rounded-xl text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#E55A2B] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {resellLoading ? 'Listing...' : `List for ${resellType === 'AUCTION' ? 'Auction' : 'Sale'}`}
                      </button>
                    </div>
                  </form>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Bids Modal */}
        <Transition show={isBidsModalOpen} as={Fragment}>
          <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={() => setIsBidsModalOpen(false)}>
            <div className="flex items-center justify-center min-h-screen px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>
              <span className="inline-block align-middle h-screen" aria-hidden="true">&#8203;</span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block bg-[#F5F5DC] rounded-2xl p-8 shadow-2xl max-w-2xl w-full align-middle border border-gray-200 relative z-10">
                  <Dialog.Title className="text-3xl font-bold text-gray-900 mb-4">Auction Bids</Dialog.Title>
                  
                  {selectedTicketBids.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-lg text-gray-600">No bids have been placed yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedTicketBids.map((bid) => (
                        <div key={bid.id} className="bg-white rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-bold text-[#FF6B35]">₹{bid.amount.toFixed(2)}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bid.status)}`}>{bid.status}</span>
                              {bid.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptOffer(bid.id)}
                                    disabled={processingOffer === bid.id}
                                    className="flex items-center px-3 py-1 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all disabled:opacity-50"
                                  >
                                    <CheckIcon className="w-4 h-4 mr-1" />
                                    {processingOffer === bid.id ? 'Accepting...' : 'Accept'}
                                  </button>
                                  <button
                                    onClick={() => handleRejectOffer(bid.id)}
                                    disabled={processingOffer === bid.id}
                                    className="flex items-center px-3 py-1 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all disabled:opacity-50"
                                  >
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    {processingOffer === bid.id ? 'Rejecting...' : 'Reject'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setIsBidsModalOpen(false)}
                      className="px-6 py-3 rounded-xl text-lg font-bold text-[#FF6B35] border-2 border-[#FF6B35] bg-white hover:bg-[#FF6B35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Cancel Listing Confirmation Modal */}
        <Transition show={!!cancelConfirmation} as={Fragment}>
          <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={() => setCancelConfirmation(null)}>
            <div className="flex items-center justify-center min-h-screen px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
              </Transition.Child>
              <span className="inline-block align-middle h-screen" aria-hidden="true">&#8203;</span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
              >
                <div className="inline-block bg-[#F5F5DC] rounded-2xl p-8 shadow-2xl max-w-md w-full align-middle border border-gray-200 relative z-10">
                  <Dialog.Title className="text-3xl font-bold text-gray-900 mb-4">Cancel Listing</Dialog.Title>
                  <p className="text-lg text-gray-600 mb-6">
                    Are you sure you want to cancel the listing for "{cancelConfirmation?.eventTitle}"? 
                    This will return the ticket to your purchased tickets.
                  </p>
                  
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setCancelConfirmation(null)}
                      className="px-6 py-3 rounded-xl text-lg font-bold text-[#FF6B35] border-2 border-[#FF6B35] bg-white hover:bg-[#FF6B35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35] transition-all"
                    >
                      Keep Listing
                    </button>
                    <button
                      onClick={() => cancelConfirmation && handleCancelListing(cancelConfirmation.ticketId)}
                      className="px-6 py-3 rounded-xl text-lg font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    >
                      Cancel Listing
                    </button>
                  </div>
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