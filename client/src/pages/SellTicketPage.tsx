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
    seat: ''
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      const response = await ticketsAPI.create({
        ...formData,
        price: parseFloat(formData.price)
      });

      if (response.success) {
        toast.success('Ticket listed successfully!');
        navigate('/my-listings');
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">List a Ticket</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="eventId" className="block text-sm font-medium text-gray-700">Event</label>
            {loadingEvents ? <LoadingSpinner /> : (
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="" disabled>Select an event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 50.00"
            />
          </div>

          <div>
            <label htmlFor="listingType" className="block text-sm font-medium text-gray-700">Listing Type</label>
            <select
              id="listingType"
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="DIRECT_SALE">Direct Sale</option>
              <option value="AUCTION">Auction</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
              <input
                type="text"
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label htmlFor="row" className="block text-sm font-medium text-gray-700">Row</label>
              <input
                type="text"
                id="row"
                name="row"
                value={formData.row}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., A"
              />
            </div>
            <div>
              <label htmlFor="seat" className="block text-sm font-medium text-gray-700">Seat</label>
              <input
                type="text"
                id="seat"
                name="seat"
                value={formData.seat}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 12"
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting || loadingEvents}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isSubmitting ? <LoadingSpinner size="sm" /> : 'List Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellTicketPage; 