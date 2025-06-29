import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ticketsAPI, bidsAPI } from '../services/api.ts';
import { Ticket, Bid } from '../types/index.ts';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, TagIcon, TicketIcon, EyeIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';

const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketBids, setSelectedTicketBids] = useState<Bid[]>([]);
  const [isBidsModalOpen, setIsBidsModalOpen] = useState(false);
  const [processingOffer, setProcessingOffer] = useState<string | null>(null);
  const [cancellingListing, setCancellingListing] = useState<string | null>(null);
  const [cancelConfirmation, setCancelConfirmation] = useState<{ ticketId: string; eventTitle: string } | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
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
      setLoading(false);
    }
  };

  const handleViewBids = async (ticketId: string) => {
    try {
      const response = await bidsAPI.getAuctionStatus(ticketId);
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
        toast.success('Offer accepted successfully!');
        setIsBidsModalOpen(false);
        fetchListings(); // Refresh listings
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
      const response = await fetch(`http://localhost:3001/api/tickets/${ticketId}/cancel-listing`, {
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
        fetchListings(); // Refresh listings
      } else {
        toast.error(data.error || 'Failed to cancel listing');
      }
    } catch (error) {
      toast.error('An error occurred while cancelling the listing.');
    } finally {
      setCancellingListing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="mt-1 text-lg text-gray-600">
            Here are the tickets you are currently selling.
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active listings</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't listed any tickets for sale yet.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {listings.map((ticket) => (
                <li key={ticket.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <Link to={`/tickets/${ticket.id}`} className="text-sm font-medium text-blue-600 truncate hover:underline">
                        {ticket.event?.title || 'Event details not available'}
                      </Link>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.listingType === 'AUCTION' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {ticket.listingType === 'AUCTION' ? 'Auction' : 'Direct Sale'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          ${ticket.price.toFixed(2)}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          Listed on {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 sm:mt-0">
                        {ticket.listingType === 'AUCTION' && (
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleViewBids(ticket.id);
                            }}
                            className="flex items-center text-sm text-blue-500 hover:text-blue-700"
                          >
                            <EyeIcon className="flex-shrink-0 mr-1.5 h-5 w-5" />
                            View Bids ({ticket._count?.bids || 0})
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setCancelConfirmation({
                              ticketId: ticket.id,
                              eventTitle: ticket.event?.title || 'Unknown Event'
                            });
                          }}
                          className="flex items-center text-sm text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="flex-shrink-0 mr-1.5 h-5 w-5" />
                          Cancel Listing
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Transition appear show={cancelConfirmation !== null} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setCancelConfirmation(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Cancel Listing
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel your listing for "{cancelConfirmation?.eventTitle}"? 
                      This will remove the ticket from sale and return it to your purchased tickets.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => {
                        if (cancelConfirmation) {
                          handleCancelListing(cancelConfirmation.ticketId);
                        }
                      }}
                      disabled={cancellingListing === cancelConfirmation?.ticketId}
                    >
                      {cancellingListing === cancelConfirmation?.ticketId ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Cancel Listing'
                      )}
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={() => setCancelConfirmation(null)}
                      disabled={cancellingListing === cancelConfirmation?.ticketId}
                    >
                      Keep Listing
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isBidsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsBidsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Bids for Ticket
                  </Dialog.Title>
                  <div className="mt-2">
                    {selectedTicketBids.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {selectedTicketBids.map(bid => (
                          <li key={bid.id} className="py-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <p className="text-sm font-medium text-gray-900">{bid.bidder?.name || 'Anonymous'}</p>
                                  <p className="text-sm text-gray-500">${bid.amount.toFixed(2)}</p>
                                </div>
                                <p className="text-xs text-gray-500">{format(new Date(bid.createdAt), 'MMM dd, yyyy - h:mm a')}</p>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(bid.status)}`}>
                                  {bid.status}
                                </span>
                              </div>
                              {bid.status === 'PENDING' && (
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => handleAcceptOffer(bid.id)}
                                    disabled={processingOffer === bid.id}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                  >
                                    {processingOffer === bid.id ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <CheckIcon className="h-3 w-3" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleRejectOffer(bid.id)}
                                    disabled={processingOffer === bid.id}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                  >
                                    {processingOffer === bid.id ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <XMarkIcon className="h-3 w-3" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No offers have been placed yet.</p>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsBidsModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default MyListingsPage; 