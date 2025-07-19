import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { FaHome, FaCalendarAlt, FaPlus, FaTicketAlt, FaUser } from 'react-icons/fa';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (href: string) => location.pathname === href;

  const navItems = [
    { to: '/', label: 'Home', icon: FaHome },
    { to: '/events', label: 'Events', icon: FaCalendarAlt },
    { to: '/sell-ticket', label: 'Sell', icon: FaPlus },
    ...(user ? [{ to: '/my-tickets', label: 'My Tickets', icon: FaTicketAlt }] : []),
    { to: user ? '/profile' : '/login', label: 'Account', icon: FaUser }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-2 px-2 sm:px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                active 
                  ? 'text-[#D6A77A] bg-[#F5E7D6]' 
                  : 'text-gray-600 hover:text-[#D6A77A] hover:bg-[#F5E7D6]'
              }`}
              aria-label={item.label}
            >
              <Icon className={`text-lg sm:text-xl mb-1 ${active ? 'scale-110' : ''} transition-transform duration-200`} />
              <span className={`text-xs font-medium truncate ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#D6A77A] rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav; 