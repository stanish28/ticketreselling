import React from 'react';
import { Link } from 'react-router-dom';
import { FaQuestionCircle, FaEnvelope, FaComments, FaShieldAlt, FaFileContract, FaCalendarAlt, FaTicketAlt, FaSignInAlt, FaUserPlus, FaInfoCircle, FaGavel, FaQuestion, FaPhone } from 'react-icons/fa';
import ContactSupportButton from '../common/ContactSupportButton.tsx';
import FeedbackButton from '../common/FeedbackButton.tsx';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="ml-2 text-xl font-bold">LayLow-India</span>
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Your trusted partner for event tickets. Buy, sell, and bid on tickets for the hottest events in your area.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaCalendarAlt className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Events</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaTicketAlt className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Tickets</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaSignInAlt className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Login</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaUserPlus className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Register</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* About Us Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              About
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaInfoCircle className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">About Us</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaGavel className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Legal</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaQuestion className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">FAQ</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <a href="mailto:support@laylow.in" className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md">
                  <FaPhone className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Contact</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md"
                >
                  <FaQuestionCircle className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Help Center</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <ContactSupportButton className="text-gray-300 hover:text-white p-2 w-full text-left rounded-lg hover:bg-gray-800 hover:shadow-md transition-all duration-200 flex items-center group bg-transparent border-none shadow-none h-auto !py-2 !px-2 !m-0 !min-h-0">
                  <FaEnvelope className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Contact Support</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </ContactSupportButton>
              </li>
              <li>
                <FeedbackButton 
                  variant="text" 
                  className="text-gray-300 hover:text-white p-2 w-full text-left rounded-lg hover:bg-gray-800 hover:shadow-md transition-all duration-200 flex items-center group"
                >
                  <FaComments className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Share Feedback</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </FeedbackButton>
              </li>
              <li>
                <Link 
                  to="/legal" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md"
                >
                  <FaShieldAlt className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Privacy Policy</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal" 
                  className="text-gray-300 hover:text-white transition-all duration-200 flex items-center group p-2 rounded-lg hover:bg-gray-800 hover:shadow-md"
                >
                  <FaFileContract className="text-[#D6A77A] mr-3 text-base group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Terms of Service</span>
                  <span className="ml-auto text-xs text-gray-500 group-hover:text-[#D6A77A] transition-colors duration-200">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300 text-xs">
            © 2024 LayLow-India. All rights reserved. Your trusted partner for event tickets.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 