import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import custom CSS for flip effect

const events = [
  {
    name: 'Garba Night',
    date: 'Sept 17',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Music Festival',
    date: 'Oct 5',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Comedy Club',
    date: 'Oct 20',
    location: 'Delhi',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
];

const whyFastPass = [
  { icon: '📈', label: 'Dynamic Price', desc: 'Get the best resale price based on demand.' },
  { icon: '✅', label: 'Verified', desc: '100% real tickets, no scams.' },
  { icon: '⚡', label: 'Instant', desc: 'Get your ticket in seconds.' },
  { icon: '₹', label: 'Low Fees', desc: 'Lowest transaction fees in the market.' },
  { icon: '🇮🇳', label: 'India-Ready', desc: 'We support UPI, Paytm, and more.' }
];

const HomePage: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#120B2C] font-sans">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-black to-purple-900 py-20 lg:py-32 flex items-center justify-center">
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4 leading-tight">
            Missed the drop?
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#A259FF] mb-6">
            We've got you covered.
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Buy & sell tickets instantly and securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/events" 
              className="bg-[#A259FF] hover:bg-purple-600 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              🎟️ Browse
            </Link>
            <Link 
              to="/sell-ticket" 
              className="border-2 border-white text-white font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:bg-white hover:text-[#120B2C] text-lg"
            >
              ⬆️ Sell
            </Link>
          </div>
        </div>
      </section>

      {/* Why FastPass Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-5 gap-4 md:gap-8">
            {whyFastPass.map((item, index) => (
              <div key={index} className="flex justify-center">
                <div className="flip-card w-full">
                  <div className="flip-card-inner">
                    {/* Front Side */}
                    <div className="flip-card-front bg-gray-50 rounded-2xl p-6 min-h-[120px] flex flex-col items-center justify-center shadow transition-all duration-300">
                      <div className="text-4xl md:text-5xl mb-3">{item.icon}</div>
                      <div className="text-sm font-semibold text-gray-700 mb-1">{item.label}</div>
                    </div>
                    {/* Back Side */}
                    <div className="flip-card-back bg-[#A259FF] rounded-2xl p-6 min-h-[120px] flex flex-col items-center justify-center shadow transition-all duration-300">
                      <div className="text-white text-xs text-center font-medium">{item.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Events Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-100">
                <div className="relative">
                  <img 
                    src={event.image} 
                    alt={event.name} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-[#A259FF] text-white px-3 py-1 rounded-full text-sm font-bold">
                    Live
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h3>
                  <div className="text-gray-600 font-medium">
                    {event.date} • {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="py-12 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold">
              Join 1000s of fans who trust FastPass.
            </h2>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 