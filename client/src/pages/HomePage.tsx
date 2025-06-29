import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api.ts';
import { Event } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';
import { CalendarIcon, MapPinIcon, TicketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';

const trendingEvents = [
  {
    id: '1',
    title: 'Sunburn Goa 2025',
    image: '/assets/sunburn.jpg',
    date: 'Dec 27, 2025',
    venue: 'Goa Beach',
    category: 'EDM',
  },
  {
    id: '2',
    title: 'Arijit Singh Live',
    image: '/assets/arijit.jpg',
    date: 'Nov 15, 2025',
    venue: 'Mumbai Arena',
    category: 'Bollywood',
  },
  {
    id: '3',
    title: 'NH7 Weekender',
    image: '/assets/nh7.jpg',
    date: 'Oct 10, 2025',
    venue: 'Pune',
    category: 'Indie',
  },
];

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsAPI.getAll({ limit: 6 });
        console.log('HomePage API response:', response); // Debug log
        
        if (response.success && response.data && Array.isArray(response.data.tickets)) {
          setEvents(response.data.tickets);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('HomePage fetch events error:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-neon-blue flex flex-col">
      {/* Hero Banner */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-24 pb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-neon mb-4 font-urbanist">
          <span className="text-neon-green">
            Your Ticket to the Hottest Concerts
          </span>
        </h1>
        <p className="text-lg md:text-2xl text-neon-pink mb-8 font-semibold">
          Buy, sell, and bid on tickets with total trust.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/events"
            className="btn-neon flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            Browse Events
          </Link>
          <Link
            to="/sell-ticket"
            className="btn-neon-outline flex items-center justify-center gap-2"
          >
            Sell a Ticket
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="bg-neon-pink text-dark px-3 py-1 rounded-full text-xs font-bold shadow-neon animate-pulse">
            Escrow Protected
          </span>
          <span className="bg-neon-green text-dark px-3 py-1 rounded-full text-xs font-bold shadow-neon animate-pulse">
            Verified Sellers
          </span>
        </div>
      </section>

      {/* Trending Events Carousel (placeholder) */}
      <section className="w-full max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-white mb-4 font-urbanist">🔥 Trending Events</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {trendingEvents.map(event => (
            <div
              key={event.id}
              className="bg-dark rounded-xl shadow-neon p-4 flex flex-col gap-2 hover:scale-105 transition-transform duration-200"
            >
              <img
                src={event.image}
                alt={event.title}
                className="rounded-lg h-40 w-full object-cover mb-2"
              />
              <div className="flex justify-between items-center">
                <span className="text-neon-green font-bold">{event.category}</span>
                <span className="bg-neon-pink text-dark px-2 py-1 rounded-full text-xs font-bold">Trending</span>
              </div>
              <h3 className="text-white font-extrabold text-lg">{event.title}</h3>
              <p className="text-neon-blue">{event.venue}</p>
              <p className="text-gray-400">{event.date}</p>
              <Link
                to={`/events/${event.id}`}
                className="btn-neon mt-2 text-center"
              >
                View Event
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full bg-dark py-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 font-urbanist">
          Ready to join the party?
        </h2>
        <p className="text-neon-green mb-6">Sign up and never miss a show again.</p>
        <Link to="/register" className="btn-neon text-lg">Sign Up Now</Link>
      </section>
    </div>
  );
};

export default HomePage; 