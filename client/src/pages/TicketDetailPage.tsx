import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, UserIcon, ClockIcon, TicketIcon } from '@heroicons/react/24/outline';
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
    role: string;
  };
  _count: {
    bids: number;
  };
}

interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  bidder: {
    id: string;
    name: string;
    email: string;
  };
}

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [minBidAmount, setMinBidAmount] = useState(1);

  useEffect(() => {
    if (id) {
      fetchTicketDetails();
    }
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tickets/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }

      const data = await response.json();
      setTicket(data.data);

      // If it's an auction, fetch bids
      if (data.data.listingType === 'AUCTION') {
        fetchBids();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch ticket details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/bids/ticket/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBids(data.data || []);
        
        // Calculate minimum bid amount (10% higher than highest bid)
        if (data.data && data.data.length > 0) {
          const highestBid = data.data[0]; // Bids are ordered by amount desc
          const minAmount = Math.max(1, highestBid.amount * 1.1);
          setMinBidAmount(minAmount);
        } else {
          setMinBidAmount(1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to purchase tickets');
      return;
    }

    setPurchasing(true);
    try {
      const purchaseData = {
        cardNumber: '4242424242424242', // Dummy payment data
        expiryDate: '12/25',
        cvv: '123'
      };

      const response = await fetch(`http://localhost:3001/api/tickets/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase ticket');
      }

      const result = await response.json();
      toast.success('Ticket purchased successfully!');
      
      // Refresh navbar ticket count
      if ((window as any).refreshNavbarTicketCount) {
        (window as any).refreshNavbarTicketCount();
      }
      
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase ticket');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to place bids');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    setPlacingBid(true);
    try {
      const response = await fetch(`http://localhost:3001/api/bids/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place bid');
      }

      const responseData = await response.json();
      toast.success(responseData.message || 'Bid placed successfully!');
      setBidAmount('');
      fetchBids(); // Refresh bids
    } catch (error: any) {
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
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

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h2>
          <p className="text-gray-600">The ticket you're looking for doesn't exist.</p>
          <Link
            to="/tickets"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isAuction = ticket.listingType === 'AUCTION';
  const isAvailable = ticket.status === 'AVAILABLE';
  const isExpired = ticket.endTime && new Date(ticket.endTime) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#231651] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/events/${ticket.event.id}`}
            className="text-neon-pink hover:text-neon-blue mb-4 inline-flex items-center"
          >
            ← Back to Event
          </Link>
          <h1 className="text-4xl font-extrabold text-white mb-2">Ticket Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Information */}
          <div className="lg:col-span-2">
            <div className="bg-[#231651] shadow-xl rounded-2xl overflow-hidden border border-[#23223a]">
              {ticket.event.image && (
                <img
                  src={ticket.event.image}
                  alt={ticket.event.title}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getListingTypeColor(ticket.listingType)}`}>{isAuction ? 'Auction' : 'Direct Sale'}</span>
                    {ticket.seller.role !== 'ADMIN' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-800">Resell Ticket</span>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{ticket.event.title}</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-300">
                    <CalendarIcon className="h-5 w-5 mr-3" />
                    {format(new Date(ticket.event.date), 'EEEE, MMMM dd, yyyy - h:mm a')}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPinIcon className="h-5 w-5 mr-3" />
                    {ticket.event.venue}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <TicketIcon className="h-5 w-5 mr-3" />
                    {ticket.section && `Section ${ticket.section}`}
                    {ticket.row && ` • Row ${ticket.row}`}
                    {ticket.seat && ` • Seat ${ticket.seat}`}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <UserIcon className="h-5 w-5 mr-3" />
                    Sold by <span className="ml-1 font-bold text-white">{ticket.seller.name}</span>
                  </div>
                </div>
                {/* Price Section */}
                <div className="border-t border-[#23223a] pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Price</span>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-3xl font-extrabold text-neon-pink">₹{ticket.price.toFixed(2)}</span>
                    </div>
                  </div>
                  {isAuction && ticket.endTime && (
                    <div className="mt-4 flex items-center text-sm text-gray-400">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {isExpired ? (
                        <span className="text-red-400">Auction ended</span>
                      ) : (
                        <span>Auction ends {format(new Date(ticket.endTime), 'MMM dd, h:mm a')}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Auction Bids */}
            {isAuction && (
              <div className="mt-8 bg-[#231651] shadow-xl rounded-2xl p-8 border border-[#23223a]">
                <h3 className="text-2xl font-extrabold text-neon-pink mb-4">Offers</h3>
                {bids.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {bids.map((bid) => (
                      <div key={bid.id} className="bg-[#18122B] rounded-lg p-4 border border-[#23223a] flex items-center justify-between">
                        <span className="text-lg font-bold text-neon-pink">₹{bid.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">No offers yet. Be the first to make an offer!</p>
                )}
              </div>
            )}
          </div>

          {/* Purchase/Auction Panel */}
          <div className="lg:col-span-1">
            <div className="bg-[#231651] shadow-xl rounded-2xl p-8 sticky top-6 border border-[#23223a]">
              {!isAvailable ? (
                <div className="text-center">
                  <div className="text-red-400 text-lg font-bold mb-2">Ticket Not Available</div>
                  <p className="text-gray-300">This ticket has been sold or is no longer available.</p>
                </div>
              ) : isAuction ? (
                /* Auction Panel */
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Make Offer</h3>
                  {!user ? (
                    <div className="text-center">
                      <p className="text-gray-300 mb-4">Please login to make an offer</p>
                      <Link
                        to="/login"
                        className="w-full bg-neon-blue text-white px-4 py-2 rounded-full hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] transition-all"
                      >
                        Login
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handlePlaceBid}>
                      <div className="mb-4">
                        <label className="block text-sm font-bold text-white mb-2">
                          Offer Amount
                        </label>
                        <div className="relative">
                          <CurrencyDollarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            step="0.01"
                            min={minBidAmount}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-[#23223a] rounded-md bg-[#18122B] text-white focus:outline-none focus:ring-2 focus:ring-neon-pink focus:border-neon-pink"
                            placeholder="Enter your offer amount"
                            required
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Minimum bid: <span className="text-neon-pink font-bold">₹{minBidAmount.toFixed(2)}</span> (10% higher than current highest bid)
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={placingBid || !!isExpired}
                        className="w-full bg-neon-blue text-white px-4 py-2 rounded-full font-bold hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {placingBid ? <LoadingSpinner size="sm" /> : 'Make Offer'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Direct Purchase Panel */
                <form onSubmit={handlePurchase}>
                  <button
                    type="submit"
                    disabled={purchasing}
                    className="w-full bg-neon-blue text-white px-4 py-2 rounded-full font-bold hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing ? <LoadingSpinner size="sm" /> : 'Purchase Ticket'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage; 