import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { HomeIcon, CalendarIcon, TicketIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [ticketCount, setTicketCount] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      fetchTicketCount();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [moreOpen]);

  const fetchTicketCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tickets/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTicketCount(data.data?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch ticket count:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Events', href: '/events', icon: CalendarIcon },
    { name: 'Tickets', href: '/tickets', icon: TicketIcon },
  ];
  const userNavigation = [
    { name: 'Profile', href: '/profile' },
    { name: 'My Tickets', href: '/my-tickets', icon: TicketIcon },
    { name: 'My Listings', href: '/my-listings' },
    { name: 'My Bids', href: '/my-bids' },
    { name: 'Sell Ticket', href: '/sell-ticket' },
  ];
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Events', href: '/admin/events', icon: CalendarIcon },
    { name: 'Tickets', href: '/admin/tickets', icon: TicketIcon },
  ];
  const mainNavigation = user?.role === 'ADMIN'
    ? adminNavigation
    : user
      ? [...navigation, { name: 'My Tickets', href: '/my-tickets', icon: TicketIcon }]
      : navigation;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="w-full bg-black rounded-2xl shadow-2xl px-8 py-4 mt-4 mb-8 flex items-center justify-between max-w-6xl mx-auto z-30">
      <div className="flex items-center gap-3">
        {/* Neon pink ticket icon SVG */}
        <svg className="w-8 h-8 text-neon-pink" fill="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="10" rx="3"/>
          <circle cx="8" cy="12" r="1.5" fill="#18122B"/>
          <circle cx="16" cy="12" r="1.5" fill="#18122B"/>
        </svg>
        <span className="text-white font-extrabold text-xl tracking-widest font-sans uppercase">CONCERT TICKET RESALE</span>
      </div>
      {/* Navigation Links */}
      <div className="flex gap-6 items-center">
        {mainNavigation.filter(item => item.name !== 'Tickets').map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-white font-bold text-lg hover:text-neon-pink hover:underline hover:underline-offset-8 hover:decoration-neon-blue transition-all relative"
          >
            {item.name}
            {item.name === 'My Tickets' && ticketCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-neon-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {ticketCount}
              </span>
            )}
          </Link>
        ))}
        {/* More Dropdown (custom, closes on outside click) */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setMoreOpen((open) => !open)}
            className="px-4 py-2 rounded-full bg-black border-2 border-neon-pink text-neon-pink font-bold text-lg flex items-center gap-2 hover:bg-[#231651] hover:text-white transition-all select-none"
          >
            More
            <svg className={`w-5 h-5 text-neon-pink transition-transform ${moreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {moreOpen && (
            <div className="absolute right-0 mt-2 w-48 flex flex-col gap-2 bg-[#18122B] rounded-xl shadow-lg p-4 border border-neon-pink z-50">
              <Link to="/my-bids" className="text-neon-blue font-bold text-lg hover:text-neon-pink transition-all" onClick={() => setMoreOpen(false)}>My Bids</Link>
              <Link to="/my-listings" className="text-neon-blue font-bold text-lg hover:text-neon-pink transition-all" onClick={() => setMoreOpen(false)}>My Listings</Link>
              <Link to="/sell-ticket" className="text-neon-blue font-bold text-lg hover:text-neon-pink transition-all" onClick={() => setMoreOpen(false)}>Sell Ticket</Link>
              <Link to="/profile" className="text-neon-blue font-bold text-lg hover:text-neon-pink transition-all" onClick={() => setMoreOpen(false)}>Profile</Link>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-8 items-center">
        {user ? (
          <>
            <span className="text-white font-bold text-lg">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-neon-pink font-bold text-lg hover:text-neon-blue hover:underline hover:underline-offset-8 hover:decoration-4 transition-all"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register" className="text-neon-pink font-bold text-lg hover:text-neon-blue hover:underline hover:underline-offset-8 hover:decoration-4 transition-all">Sign Up</Link>
            <Link to="/login" className="text-neon-pink font-bold text-lg hover:text-neon-blue hover:underline hover:underline-offset-8 hover:decoration-4 transition-all">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 