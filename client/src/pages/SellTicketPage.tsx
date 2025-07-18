import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, ticketsAPI } from '../services/api.ts';
import { Event, ListingType } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import toast from 'react-hot-toast';

const SellTicketPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    eventId: '',
    price: '',
    listingType: 'DIRECT_SALE' as ListingType,
    section: '',
    row: '',
    seat: '',
    endTime: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getAll({ limit: 100 }); // Fetch a good number of events
        if (response.success && response.data && Array.isArray(response.data.events)) {
          setEvents(response.data.events);
        } else {
          toast.error('Could not fetch events.');
        }
      } catch (error) {
        toast.error('An error occurred while fetching events.');
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'listingType' ? (value as ListingType) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.eventId || !formData.price) {
      toast.error('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const ticketData: any = {
        ...formData,
        price: parseFloat(formData.price)
      };
      if (formData.listingType !== 'AUCTION') {
        delete ticketData.endTime;
      }
      const response = await ticketsAPI.create(ticketData);

      if (response.success) {
        toast.success('Ticket listed successfully!');
        navigate('/my-tickets');
      } else {
        toast.error(response.message || 'Failed to list ticket.');
      }
    } catch (error) {
      toast.error('An error occurred while listing the ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FAF8F6] to-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#D6A77A]/10 to-[#FF6B35]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-tl from-[#FF6B35]/10 to-[#D6A77A]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-[#D6A77A]/5 to-[#FF6B35]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg tracking-wide">
            <span className="animate-pulse">📤</span>
            Sell Your Ticket
            <span className="animate-pulse">💰</span>
          </div>
          <h1 className="text-4xl font-display text-[#222] mb-4 bg-gradient-to-r from-[#222] via-[#D6A77A] to-[#FF6B35] bg-clip-text text-transparent">
            List Your Ticket
          </h1>
          <p className="text-body-large text-[#6B6B6B] max-w-lg mx-auto">
            Turn your extra tickets into cash! List them for sale or auction and reach thousands of buyers.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-[#E5E5E5] p-8 relative overflow-hidden">
          {/* Card background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D6A77A]/5 to-[#FF6B35]/5 rounded-full blur-2xl"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Event Selection */}
            <div className="space-y-2">
              <label htmlFor="eventId" className="block text-lg font-display text-[#222] font-semibold">
                Select Event <span className="text-[#FF6B35]">*</span>
              </label>
              {loadingEvents ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <select
                  id="eventId"
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:border-[#D6A77A] transition-all duration-300 bg-white hover:border-[#D6A77A]/50"
                >
                  <option value="" disabled>Choose an event to sell tickets for</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-lg font-display text-[#222] font-semibold">
                Price (₹) <span className="text-[#FF6B35]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl text-[#D6A77A]">₹</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-[#E5E5E5] rounded-xl shadow-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:border-[#D6A77A] transition-all duration-300 bg-white hover:border-[#D6A77A]/50"
                  placeholder="Enter your asking price"
                />
              </div>
            </div>

            {/* Listing Type */}
            <div className="space-y-2">
              <label htmlFor="listingType" className="block text-lg font-display text-[#222] font-semibold">
                Listing Type
              </label>
              <select
                id="listingType"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg border-2 border-[#E5E5E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:border-[#D6A77A] transition-all duration-300 bg-white hover:border-[#D6A77A]/50"
              >
                <option value="DIRECT_SALE">🛒 Direct Sale (Fixed Price)</option>
                <option value="AUCTION">🏷️ Auction (Bidding)</option>
              </select>
            </div>

            {/* Auction End Time */}
            {formData.listingType === 'AUCTION' && (
              <div className="space-y-2">
                <label htmlFor="endTime" className="block text-lg font-display text-[#222] font-semibold">
                  Auction End Time <span className="text-[#FF6B35]">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-lg border-2 border-[#E5E5E5] rounded-xl shadow-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:border-[#D6A77A] transition-all duration-300 bg-white hover:border-[#D6A77A]/50"
                />
              </div>
            )}

            {/* Seat Details */}
            <div className="space-y-4">
              <label className="block text-lg font-display text-[#222] font-semibold">
                Seat Details
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="section" className="block text-sm font-semibold text-[#6B6B6B]">
                    Section
                  </label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border-2 border-[#E5E5E5] rounded-xl shadow-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:border-[#D6A77A] transition-all duration-300 bg-white hover:border-[#D6A77A]/50"
                    placeholder="e.g., 101"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="row" className="block text-sm font-semibold text-[#6B6B6B]">
                    Row
                  </label>
                  <input
                    type="text"
                    id="row"
                    name="row"
                    value={formData.row}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border-2 border-[#E5E5E5] rounded-xl shadow-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:border-[#D6A77A] transition-all duration-300 bg-white hover:border-[#D6A77A]/50"
                    placeholder="e.g., A"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="seat" className="block text-sm font-semibold text-[#6B6B6B]">
                    Seat
                  </label>
                  <input
                    type="text"
                    id="seat"
                    name="seat"
                    value={formData.seat}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base border-2 border-[#E5E5E5] rounded-xl shadow-sm placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:border-[#D6A77A] transition-all duration-300 bg-white hover:border-[#D6A77A]/50"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || loadingEvents}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-lg font-bold text-white bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] hover:from-[#b98a5e] hover:to-[#E55A2B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D6A77A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Listing Ticket...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>📤</span>
                    <span>List Ticket</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] rounded-3xl p-6 text-white text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-2xl">💡</span>
            <h3 className="text-xl font-bold font-display">Selling Tips</h3>
            <span className="text-2xl">💡</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">✅</span>
              <span>Set competitive prices</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">✅</span>
              <span>Add clear seat details</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">✅</span>
              <span>Respond quickly to buyers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellTicketPage; 