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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/events/${ticket.event.id}`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
          >
            ← Back to Event
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ticket Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {ticket.event.image && (
                <img
                  src={ticket.event.image}
                  alt={ticket.event.title}
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getListingTypeColor(ticket.listingType)}`}>
                      {isAuction ? 'Auction' : 'Direct Sale'}
                    </span>
                    {ticket.seller.role !== 'ADMIN' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        Resell Ticket
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">{ticket.event.title}</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-5 w-5 mr-3" />
                    {format(new Date(ticket.event.date), 'EEEE, MMMM dd, yyyy - h:mm a')}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-3" />
                    {ticket.event.venue}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <TicketIcon className="h-5 w-5 mr-3" />
                    {ticket.section && `Section ${ticket.section}`}
                    {ticket.row && ` • Row ${ticket.row}`}
                    {ticket.seat && ` • Seat ${ticket.seat}`}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserIcon className="h-5 w-5 mr-3" />
                    Sold by {ticket.seller.name}
                  </div>
                </div>

                {/* Price Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-900">Price</span>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-gray-400 mr-2" />
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{ticket.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {isAuction && ticket.endTime && (
                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {isExpired ? (
                        <span className="text-red-600">Auction ended</span>
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
              <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Offers</h3>
                {bids.length > 0 ? (
                  <div className="space-y-3">
                    {bids.map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">₹{bid.amount.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No offers yet. Be the first to make an offer!</p>
                )}
              </div>
            )}
          </div>

          {/* Purchase/Auction Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              {!isAvailable ? (
                <div className="text-center">
                  <div className="text-red-600 text-lg font-medium mb-2">Ticket Not Available</div>
                  <p className="text-gray-600">This ticket has been sold or is no longer available.</p>
                </div>
              ) : isAuction ? (
                /* Auction Panel */
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Make Offer</h3>
                  {!user ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Please login to make an offer</p>
                      <Link
                        to="/login"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Login
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handlePlaceBid}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your offer amount"
                            required
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Minimum bid: ₹{minBidAmount.toFixed(2)} (10% higher than current highest bid)
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={placingBid || !!isExpired}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {placingBid ? <LoadingSpinner size="sm" /> : 'Make Offer'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* Direct Sale Panel */
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Ticket</h3>
                  {!user ? (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Please login to purchase this ticket</p>
                      <Link
                        to="/login"
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Login
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Total Price</p>
                        <div className="text-2xl font-bold text-gray-900">
                          ₹{ticket.price.toFixed(2)}
                        </div>
                      </div>
                      
                      {showPurchaseForm ? (
                        <form onSubmit={handlePurchase}>
                          <div className="space-y-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                defaultValue="4242424242424242"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="1234 5678 9012 3456"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  defaultValue="12/25"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="MM/YY"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  CVV
                                </label>
                                <input
                                  type="text"
                                  defaultValue="123"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="123"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowPurchaseForm(false)}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={purchasing}
                              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {purchasing ? <LoadingSpinner size="sm" /> : 'Complete Purchase'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setShowPurchaseForm(true)}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage; 