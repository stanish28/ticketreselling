import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow-sm py-5 px-4 md:px-10 flex items-center justify-between text-lg" style={{minHeight: '72px'}}>
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2">
          <span className="w-9 h-9 rounded-lg bg-[#D6A77A] flex items-center justify-center font-extrabold text-white text-2xl">L</span>
          <span className="font-extrabold text-2xl text-[#222] tracking-tight">Fastpass</span>
        </Link>
        {user && user.role === 'ADMIN' ? (
          <div className="hidden md:flex items-center space-x-10 ml-10">
            <Link to="/admin" className={`text-[#222] font-semibold hover:text-[#D6A77A]${isActive('/admin') ? ' underline' : ''}`}>Dashboard</Link>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-10 ml-10">
            <Link to="/" className={`text-[#222] font-semibold hover:text-[#D6A77A]${isActive('/') ? ' underline' : ''}`}>Home</Link>
            <Link to="/events" className={`text-[#222] font-semibold hover:text-[#D6A77A]${isActive('/events') ? ' underline' : ''}`}>Events</Link>
            {user && (
              <Link to="/my-tickets" className={`text-[#222] font-semibold hover:text-[#D6A77A]${isActive('/my-tickets') ? ' underline' : ''}`}>My Tickets</Link>
            )}
          </div>
        )}
      </div>
      {(!user || user.role !== 'ADMIN') && (
        <div className="flex-1 flex justify-center mx-6">
          <input
            type="text"
            placeholder="Search events…"
            className="w-full max-w-md px-5 py-3 rounded-full border border-[#E5E5E5] bg-[#FAF8F6] text-[#222] placeholder-[#A9A9A9] focus:outline-none focus:ring-2 focus:ring-[#D6A77A] text-base"
          />
        </div>
      )}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold text-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="font-semibold text-[#222] hover:text-[#FF6B35] transition-colors cursor-pointer">
                  {user.name}
                </div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-[#FF6B35] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#E55A2B] transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link to="/register" className="px-6 py-3 rounded-full font-bold bg-[#D6A77A] text-white shadow hover:bg-[#b98a5e] transition text-base">Sign Up</Link>
            <Link to="/login" className="px-6 py-3 rounded-full font-bold bg-white border border-[#E5E5E5] text-[#222] hover:bg-[#F5E7D6] transition text-base">Log In</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 