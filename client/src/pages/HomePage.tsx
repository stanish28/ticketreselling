import React from 'react';
import { Link } from 'react-router-dom';

const events = [
  {
    name: 'Ultra Music Festival',
    date: 'July 12, 2025',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Aogisthe Night',
    date: 'August 2, 2025',
    price: '$85',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'EDM Blast',
    date: 'September 19, 2025',
    price: '$150',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18122B] to-[#231651] font-sans flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full max-w-5xl bg-black rounded-2xl px-8 py-4 mt-6 mb-8 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Neon pink ticket icon SVG */}
          <svg className="w-8 h-8 text-neon-pink" fill="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="10" rx="3"/>
            <circle cx="8" cy="12" r="1.5" fill="#18122B"/>
            <circle cx="16" cy="12" r="1.5" fill="#18122B"/>
          </svg>
          <span className="text-white font-extrabold text-xl tracking-widest font-sans uppercase">CONCERT TICKET RESALE</span>
        </div>
        <div className="flex gap-8">
          <Link to="/register" className="text-neon-pink font-bold text-lg hover:text-neon-blue hover:underline hover:underline-offset-8 hover:decoration-4 transition-all">Sign Up</Link>
          <Link to="/login" className="text-neon-pink font-bold text-lg hover:text-neon-blue hover:underline hover:underline-offset-8 hover:decoration-4 transition-all">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-14 w-full">
        <h1 className="text-neon-pink font-extrabold uppercase text-5xl md:text-7xl font-sans mb-6 tracking-tight" style={{lineHeight: 1.05}}>BUY & SELL CONCERT TICKETS</h1>
        <p className="text-white text-xl md:text-2xl mb-10 font-medium">Find great deals on resale tickets for live shows.</p>
        <Link to="/events" className="bg-neon-blue text-white font-bold text-xl px-12 py-5 rounded-full shadow-[0_0_24px_4px_#1E90FF] transition-all hover:bg-neon-pink hover:shadow-[0_0_32px_8px_#FF1EC6] hover:scale-105 uppercase">GET STARTED</Link>
      </section>

      {/* Popular Events Section */}
      <section className="w-full max-w-5xl mx-auto mt-12 px-4">
        <div className="bg-black rounded-3xl p-10 shadow-2xl">
          <h2 className="text-white font-extrabold text-3xl mb-10 uppercase tracking-wide">POPULAR EVENTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {events.map((event) => (
              <div
                key={event.name}
                className="bg-black rounded-2xl overflow-hidden shadow-lg transform transition-transform hover:scale-105 hover:shadow-[0_0_24px_4px_#1E90FF,0_0_32px_8px_#FF1EC6] flex flex-col border-2 border-transparent hover:border-neon-pink"
              >
                <img src={event.image} alt={event.name} className="w-full h-52 object-cover" />
                <div className="p-6 flex flex-col gap-2 flex-1">
                  <span className="text-white font-bold text-2xl mt-2">{event.name}</span>
                  <span className="text-neon-blue font-bold text-lg">{event.date}</span>
                  <span className="text-neon-pink font-bold text-lg">{event.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 