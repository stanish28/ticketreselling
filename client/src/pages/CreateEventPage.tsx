import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { eventsAPI } from '../services/api.ts';

interface CreateEventFormData {
  title: string;
  description: string;
  venue: string;
  date: string;
  time: string;
  category: string;
  capacity: number;
  image?: string;
}

const CreateEventPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateEventFormData>();

  const onSubmit = async (data: CreateEventFormData) => {
    if (user?.role !== 'ADMIN') {
      toast.error('Only admins can create events');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time and format as proper ISO-8601 DateTime
      const dateTime = new Date(`${data.date}T${data.time}:00.000Z`).toISOString();
      
      // Only send the required fields to the API
      const eventData = {
        title: data.title,
        description: data.description,
        venue: data.venue,
        date: dateTime,
        category: data.category,
        capacity: parseInt(data.capacity.toString()),
        image: data.image || undefined
      };
      
      console.log('Sending event data:', eventData); // Debug log
      
      const result = await eventsAPI.create(eventData);
      console.log('Success response:', result); // Debug log
      
      toast.success('Event created successfully!');
      navigate('/admin/events');
    } catch (error: any) {
      console.error('Create event error:', error); // Debug log
      toast.error(error.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Only administrators can create events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="mt-2 text-gray-600">Add a new event to the platform</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title *
              </label>
              <input
                id="title"
                type="text"
                {...register('title', { required: 'Event title is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                {...register('category', { required: 'Category is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select a category</option>
                <option value="CONCERT">Concert</option>
                <option value="SPORTS">Sports</option>
                <option value="THEATER">Theater</option>
                <option value="COMEDY">Comedy</option>
                <option value="CONFERENCE">Conference</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                Venue *
              </label>
              <input
                id="venue"
                type="text"
                {...register('venue', { required: 'Venue is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.venue ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter venue name"
              />
              {errors.venue && (
                <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity *
              </label>
              <input
                id="capacity"
                type="number"
                min="1"
                {...register('capacity', { 
                  required: 'Capacity is required',
                  min: { value: 1, message: 'Capacity must be at least 1' }
                })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.capacity ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Enter capacity"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                id="date"
                type="date"
                {...register('date', { required: 'Date is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time *
              </label>
              <input
                id="time"
                type="time"
                {...register('time', { required: 'Time is required' })}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.time ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter event description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              Image URL (Optional)
            </label>
            <input
              id="image"
              type="url"
              {...register('image')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage; 