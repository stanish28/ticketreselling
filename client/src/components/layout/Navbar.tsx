import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    ...(user ? [{ to: '/my-tickets', label: 'My Tickets' }] : [])
  ];

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm py-4 px-4 md:px-8 flex items-center justify-between text-base">
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2" aria-label="LayLow-India Home">
          <span className="w-7 h-7 rounded-lg bg-[#D6A77A] flex items-center justify-center font-extrabold text-white text-base">L</span>
          <span className="font-display font-extrabold text-xl text-[#222] tracking-tight">LayLow-India</span>
        </Link>
        {/* Desktop Nav Links */}
        {user && user.role === 'ADMIN' ? (
          <ul className="hidden md:flex items-center space-x-8 ml-8" role="menubar">
            <li>
              <Link to="/admin" className={`font-semibold px-3 py-2 rounded-lg transition-colors ${isActive('/admin') ? 'bg-[#F5E7D6] text-[#D6A77A] font-bold' : 'text-[#222] hover:text-[#D6A77A]'}`}>Dashboard</Link>
            </li>
          </ul>
        ) : (
          <ul className="hidden md:flex items-center space-x-8 ml-8" role="menubar">
            {navLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`font-semibold px-3 py-2 rounded-lg transition-colors ${isActive(link.to) ? 'bg-[#F5E7D6] text-[#D6A77A] font-bold' : 'text-[#222] hover:text-[#D6A77A]'}`}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Desktop User Actions */}
      <div className="hidden md:flex items-center space-x-3">
        {user ? (
          <div className="relative">
            <button
              aria-label="Profile menu"
              className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              onClick={() => setProfileOpen(v => !v)}
            >
              <div className="w-9 h-9 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold text-base">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="font-semibold text-[#222] hover:text-[#FF6B35] transition-colors cursor-pointer">
                  {user.name}
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <FaChevronDown className="ml-1 text-[#D6A77A]" />
            </button>
            {/* Profile Dropdown */}
            {profileOpen && (
              <ul className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E5E5] rounded-lg shadow-lg py-2 z-50" role="menu">
                <li>
                  <Link to="/profile" className="block px-4 py-2 text-[#222] hover:bg-[#F5E7D6] transition-colors" role="menuitem">Profile</Link>
                </li>
                <li>
                  <Link to="/my-tickets" className="block px-4 py-2 text-[#222] hover:bg-[#F5E7D6] transition-colors" role="menuitem">My Tickets</Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-[#FF6B35] hover:bg-[#F5E7D6] transition-colors" role="menuitem">Logout</button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <>
            <Link to="/register" className="px-5 py-2.5 rounded-full font-bold bg-[#D6A77A] text-white shadow hover:bg-[#b98a5e] transition text-sm">Sign Up</Link>
            <Link to="/login" className="px-5 py-2.5 rounded-full font-bold bg-white border border-[#E5E5E5] text-[#222] hover:bg-[#F5E7D6] transition text-sm">Log In</Link>
          </>
        )}
      </div>
      {/* Hamburger Menu for Mobile */}
      <div className="md:hidden flex items-center">
        <button aria-label="Open menu" onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-[#F5E7D6] transition-colors">
          <FaBars className="text-2xl text-[#D6A77A]" />
        </button>
      </div>
      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            {/* Header with Logo and Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileOpen(false)}>
                <span className="w-8 h-8 rounded-lg bg-[#D6A77A] flex items-center justify-center font-extrabold text-white text-lg">L</span>
                <span className="font-display font-extrabold text-xl text-[#222] tracking-tight">LayLow-India</span>
              </Link>
              <button 
                aria-label="Close menu" 
                onClick={() => setMobileOpen(false)} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaTimes className="text-xl text-[#D6A77A]" />
              </button>
            </div>

            {/* User Profile Section (if logged in) */}
            {user && (
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#F5E7D6] to-[#FAF8F6]">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[#222] text-lg">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Only Section */}
            <div className="flex-1 p-6 pb-24 flex items-center justify-center">
              {user ? (
                <div className="w-full max-w-sm">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-bold text-[#222] mb-2">Welcome back, {user.name}!</h3>
                    <p className="text-sm text-gray-600">Ready to sign out?</p>
                  </div>
                  
                  <button 
                    onClick={() => { setMobileOpen(false); handleLogout(); }} 
                    className="w-full flex items-center justify-center px-6 py-4 text-[#FF6B35] rounded-xl transition-all duration-200 hover:bg-red-50 border-2 border-[#FF6B35] hover:border-red-400 font-semibold text-lg"
                  >
                    <span className="text-xl mr-3">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600">Please log in to access your account.</p>
                </div>
              )}
            </div>

            {/* Auth Buttons (if not logged in) */}
            {!user && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 pb-24">
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/register" 
                    className="px-6 py-4 rounded-xl font-bold bg-[#D6A77A] text-white shadow-lg hover:bg-[#b98a5e] transition-all duration-200 text-center text-base" 
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-6 py-4 rounded-xl font-bold bg-white border-2 border-[#D6A77A] text-[#D6A77A] hover:bg-[#F5E7D6] transition-all duration-200 text-center text-base" 
                    onClick={() => setMobileOpen(false)}
                  >
                    Log In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 