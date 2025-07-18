import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import custom CSS for flip effect
import { FaSearch, FaLock, FaRegSmile, FaUsers, FaTicketAlt, FaShieldAlt, FaCreditCard } from "react-icons/fa";

const events = [
  {
    name: 'Garba Night',
    date: 'Sept 17',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    price: 999,
    badges: ['🔥 Trending', '⏳ Only 4 left', '✅ Verified Seller'],
    originalPrice: 1299
  },
  {
    name: 'Music Festival',
    date: 'Oct 5',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    price: 1499,
    badges: ['🔥 Trending', '⏳ Only 2 left', '✅ Verified Seller'],
    originalPrice: 1999
  },
  {
    name: 'Comedy Club',
    date: 'Oct 20',
    location: 'Delhi',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    price: 799,
    badges: ['🔥 Trending', '⏳ Only 6 left', '✅ Verified Seller'],
    originalPrice: 999
  },
];

const whyFastPass = [
  { icon: '📈', label: 'Dynamic Price', desc: 'Get the best resale price based on demand.' },
  { icon: '✅', label: 'Verified', desc: '100% real tickets, no scams.' },
  { icon: '⚡', label: 'Instant', desc: 'Get your ticket in seconds.' },
  { icon: '₹', label: 'Low Fees', desc: 'Lowest transaction fees in the market.' },
  { icon: '🇮🇳', label: 'India-Ready', desc: 'We support UPI, Paytm, and more.' }
];

// --- Helper Components ---
const TabNav: React.FC<{ active: string, setActive: (tab: string) => void }> = ({ active, setActive }) => (
  <div className="flex border-b border-[#E5E5E5] mb-8">
    {['Buy Tickets', 'Resell Tickets', 'Auction Tickets'].map(tab => (
      <button
        key={tab}
        className={`px-6 py-3 text-base font-semibold transition-colors ${active === tab
            ? 'border-b-2 border-[#D6A77A] text-[#222] bg-white'
            : 'text-[#A9A9A9] bg-transparent'
          }`}
        style={{ borderRadius: '12px 12px 0 0' }}
        onClick={() => setActive(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);

const InfoBadge: React.FC<{ icon: React.ReactNode; title: React.ReactNode; desc: React.ReactNode }> = ({ icon, title, desc }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#F5E7D6] flex items-center justify-center text-2xl">{icon}</div>
    <div>
      <div className="font-bold text-[#222] mb-1">{title}</div>
      <div className="text-[#6B6B6B] text-sm">{desc}</div>
    </div>
  </div>
);

const TestimonialCard: React.FC<{ name: string; city: string; rating: number; text: string; img?: string }> = ({
  name, city, rating, text, img
}) => (
  <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-start w-full max-w-md transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer">
    <div className="flex items-center mb-3">
      <div className="w-12 h-12 rounded-full bg-[#F5E7D6] flex items-center justify-center text-xl font-bold text-[#D6A77A] mr-3">
        {img ? <img src={img} alt={name} className="w-12 h-12 rounded-full" /> : name[0]}
      </div>
      <div>
        <div className="font-bold text-[#222]">{name}</div>
        <div className="text-xs text-[#A9A9A9]">{city}</div>
      </div>
    </div>
    <div className="flex items-center mb-2">
      <span className="text-[#D6A77A] text-lg mr-1">
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 ? '½' : ''}
      </span>
      <span className="text-xs text-[#A9A9A9] ml-1">{rating}/5</span>
    </div>
    <div className="text-[#444] text-sm">{text}</div>
  </div>
);

// --- Playful Stepper Data ---
const journeySteps = [
  {
    label: 'Browse & Discover',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="#F5E7D6" /><g><ellipse cx="32" cy="32" rx="18" ry="12" fill="#FF6B35" /><rect x="22" y="26" width="20" height="12" rx="4" fill="#fff" /><path d="M44 44l8 8" stroke="#A2592A" strokeWidth="3" strokeLinecap="round" /><circle cx="28" cy="32" r="2.5" fill="#FF6B35" /><circle cx="36" cy="32" r="2.5" fill="#FF6B35" /></g></svg>
    ),
    extra: 'Find tickets to your favorite events with ease. Our platform offers a wide selection of verified tickets, ensuring a smooth and secure purchase process.'
  },
  {
    label: 'Secure Purchase',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="#F5E7D6" /><g><rect x="24" y="18" width="16" height="28" rx="4" fill="#FF6B35" /><rect x="28" y="32" width="8" height="8" rx="2" fill="#fff" /><rect x="30.5" y="40" width="3" height="7" rx="1.5" fill="#A2592A" /><rect x="28" y="22" width="8" height="4" rx="2" fill="#fff" /><rect x="32" y="18" width="4" height="6" rx="2" fill="#A2592A" /></g></svg>
    ),
    extra: 'All purchases are protected with secure payment and ticket delivery. Your information and tickets are always safe with Fastpass.'
  },
  {
    label: 'Enjoy the Event',
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="#F5E7D6" /><g><path d="M20 48c0-8 6-16 12-16s12 8 12 16" stroke="#FF6B35" strokeWidth="3" /><circle cx="32" cy="28" r="6" fill="#FF6B35" /><path d="M32 12v8M48 20l-6 6M16 20l6 6" stroke="#A2592A" strokeWidth="3" strokeLinecap="round" /><path d="M26 22c0-2 4-2 4 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" /><path d="M38 22c0-2-4-2-4 0" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></g></svg>
    ),
    extra: 'Show your ticket at the event and enjoy! We make sure your entry is smooth and hassle-free.'
  }
];

// Add social proof data
const socialProofData = {
  userCount: "50,000+",
  ticketsSold: "1,247",
  trustScore: "99.8%",
  supportHours: "24/7"
};

const trustBadges = [
  { icon: <FaShieldAlt className="text-2xl" />, text: "256-bit SSL Security" },
  { icon: <FaCreditCard className="text-2xl" />, text: "Secure Payments" },
  { icon: <FaTicketAlt className="text-2xl" />, text: "100% Verified Tickets" },
  { icon: <FaUsers className="text-2xl" />, text: "Money-back Guarantee" }
];

// Add live ticker data
const liveTickerItems = [
  "🎫 Priya just bought Taylor Swift tickets in Mumbai",
  "⚽ IPL final tickets selling fast in Bangalore", 
  "🎭 Comedy show tickets available in Delhi",
  "🎸 Ed Sheeran concert tickets released in Chennai",
  "🏏 Cricket match tickets selling in Kolkata"
];

// Add featured event categories
const eventCategories = [
  { name: 'Music Concerts', icon: '🎵', count: '2,341 tickets' },
  { name: 'Sports Events', icon: '⚽', count: '1,892 tickets' },
  { name: 'Comedy Shows', icon: '😂', count: '567 tickets' },
  { name: 'Cultural Events', icon: '🎭', count: '1,234 tickets' }
];

// --- Main Home Page ---

function HowItWorks() {
  return (
    <section className="w-full max-w-5xl mx-auto py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#222] mb-8">How It Works</h2>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Step 1 Card */}
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-[#F5E7D6] flex items-center justify-center mb-4">
            <FaSearch className="text-[36px] text-[#FF6B35]" />
          </div>
          <div className="font-bold text-[#222] text-xl mb-2 text-center">Browse & Discover</div>
          <div className="text-[#6B6B6B] text-base text-center">
            Find tickets to your favorite events with ease. Our platform offers a wide selection of verified tickets, ensuring a smooth and secure purchase process.
          </div>
        </div>
        {/* Step 2 Card */}
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-[#F5E7D6] flex items-center justify-center mb-4">
            <FaLock className="text-[36px] text-[#FF6B35]" />
          </div>
          <div className="font-bold text-[#222] text-xl mb-2 text-center">Secure Purchase</div>
          <div className="text-[#6B6B6B] text-base text-center">
            All purchases are protected with secure payment and ticket delivery. Your information and tickets are always safe with Fastpass.
          </div>
        </div>
        {/* Step 3 Card */}
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-[#F5E7D6] flex items-center justify-center mb-4">
            <FaRegSmile className="text-[36px] text-[#FF6B35]" />
          </div>
          <div className="font-bold text-[#222] text-xl mb-2 text-center">Enjoy the Event</div>
          <div className="text-[#6B6B6B] text-base text-center">
            Show your ticket at the event and enjoy! We make sure your entry is smooth and hassle-free.
          </div>
        </div>
      </div>
    </section>
  );
}

// Add Live Ticker Component
const LiveTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveTickerItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#D6A77A] text-white py-2 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto flex items-center justify-center">
        <span className="text-sm font-medium animate-pulse mr-2">🔴 LIVE</span>
        <span className="text-sm">{liveTickerItems[currentIndex]}</span>
      </div>
    </div>
  );
};

// Add Social Proof Stats Component
const SocialProofStats: React.FC = () => (
  <section className="w-full py-8 bg-white border-b border-[#E5E5E5]">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-bold text-[#D6A77A] mb-1">
            {socialProofData.userCount}
          </div>
          <div className="text-sm text-[#6B6B6B]">Satisfied Users</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-bold text-[#D6A77A] mb-1">
            {socialProofData.ticketsSold}
          </div>
          <div className="text-sm text-[#6B6B6B]">Tickets Sold This Week</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-bold text-[#D6A77A] mb-1">
            {socialProofData.trustScore}
          </div>
          <div className="text-sm text-[#6B6B6B]">Trust Score</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-3xl font-bold text-[#D6A77A] mb-1">
            {socialProofData.supportHours}
          </div>
          <div className="text-sm text-[#6B6B6B]">Customer Support</div>
        </div>
      </div>
    </div>
  </section>
);

// Add Trust Badges Component
const TrustBadges: React.FC = () => (
  <section className="w-full py-6 bg-[#FAF8F6]">
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
        {trustBadges.map((badge, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <div className="text-[#D6A77A]">{badge.icon}</div>
            <span className="text-sm font-medium text-[#6B6B6B]">{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Add Press Mentions Component
const PressMentions: React.FC = () => (
  <section className="w-full py-6 bg-white border-t border-[#E5E5E5]">
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center">
        <p className="text-sm text-[#A9A9A9] mb-3">Featured in</p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 opacity-60">
          <span className="text-lg font-bold text-[#6B6B6B]">Economic Times</span>
          <span className="text-lg font-bold text-[#6B6B6B]">YourStory</span>
          <span className="text-lg font-bold text-[#6B6B6B]">TechCrunch India</span>
          <span className="text-lg font-bold text-[#6B6B6B]">Inc42</span>
        </div>
      </div>
    </div>
  </section>
);

const HomePage: React.FC = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tab, setTab] = useState('Buy Tickets');

  return (
    <div className="bg-[#FAF8F6] min-h-screen font-sans">
      {/* Live Ticker */}
      <LiveTicker />
      
      {/* Hero Section */}
      <section className="relative w-full h-[420px] md:h-[520px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src="/concert-hero.png"
          alt="Concert Crowd"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 pb-12 bg-black/40">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white text-center mb-4 drop-shadow">
            Get Sold-Out Tickets at Fair Prices
          </h1>
          <p className="text-lg md:text-xl text-white text-center mb-4 max-w-2xl drop-shadow">
            100% Verified & Secure • No Hidden Fees • Instant QR Codes
          </p>
          <p className="text-base md:text-lg text-white text-center mb-8 max-w-2xl drop-shadow opacity-90">
            India's most trusted platform for buying and selling event tickets with complete peace of mind.
          </p>
          <div className="w-full max-w-md flex items-center bg-white rounded-full shadow-md px-4 py-2 mb-4 mt-2">
            <FaSearch className="text-[#D6A77A] text-lg mr-2" />
            <input
              type="text"
              placeholder="Search events, artists, or venues..."
              className="flex-1 bg-transparent outline-none text-[#222] placeholder-[#A9A9A9] text-base"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <a href="#events" className="px-8 py-3 rounded-full font-bold bg-[#D6A77A] text-white shadow hover:bg-[#b98a5e] transition-transform duration-150 hover:scale-105 active:scale-95 text-lg">Browse Events</a>
            <a href="/sell-ticket" className="px-8 py-3 rounded-full font-bold bg-transparent border-2 border-white text-white shadow hover:bg-white hover:text-[#222] transition-all duration-150 hover:scale-105 active:scale-95 text-lg flex items-center gap-2">
              <span>📤</span>
              List My Ticket
            </a>
          </div>
        </div>
      </section>

      {/* Add a Trending Tickets section after the hero section and before SocialProofStats */}
      <section id="events" className="w-full max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#222] mb-8 text-center">Trending Tickets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {events.map((event, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 group cursor-pointer">
              {/* Badges */}
              <div className="w-full flex flex-wrap gap-2 mb-3">
                {event.badges.map((badge, badgeIdx) => (
                  <span key={badgeIdx} className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] text-white shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
              
              {/* Image with overlay */}
              <div className="relative w-full mb-4 overflow-hidden rounded-xl">
                <img
                  src={event.image}
                  alt={`Event: ${event.name} in ${event.location}`}
                  loading="lazy"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Event Details */}
              <div className="w-full text-center">
                <div className="font-bold text-xl text-[#222] mb-2">{event.name}</div>
                <div className="text-[#6B6B6B] text-sm mb-3">{event.date} • {event.location}</div>
                
                {/* Price Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-3xl font-black text-[#D6A77A]">₹{event.price}</span>
                    <span className="text-lg text-[#A9A9A9] line-through">₹{event.originalPrice}</span>
                  </div>
                  <div className="text-xs text-[#D6A77A] font-semibold">
                    {Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100)}% OFF
                  </div>
                </div>
                
                {/* CTA Button */}
                <a 
                  href="#" 
                  className="w-full px-6 py-3 rounded-full font-bold bg-orange-500 text-white shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-base group-hover:shadow-[0_10px_25px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2"
                >
                  <span>🎟️</span>
                  Buy Ticket
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof Stats */}
      <SocialProofStats />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Press Mentions */}
      <PressMentions />

      {/* How It Works (Wavy Journey Map) */}
      <HowItWorks />

      {/* Safety Section */}
      <section className="w-full py-12 px-0 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#222] mb-8 text-center">Your Safety is Our Priority</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-[#F5E7D6] rounded-2xl shadow p-5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-2"> <svg width='24' height='24' fill='none' stroke='#D6A77A' strokeWidth='2' viewBox='0 0 24 24'><path d='M12 22s8-4 8-10V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7c0 6 8 10 8 10z' /><path d='M9 11l2 2 4-4' /></svg> </div>
              <div className="text-base md:text-lg font-bold mb-1">Verified Sellers</div>
              <div className="text-sm md:text-base text-[#444]">All sellers are thoroughly vetted to ensure authenticity and prevent fraud, giving you peace of mind.</div>
            </div>
            <div className="flex-1 bg-[#F5E7D6] rounded-2xl shadow p-5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-2"> <svg width='24' height='24' fill='none' stroke='#D6A77A' strokeWidth='2' viewBox='0 0 24 24'><rect x='3' y='3' width='18' height='18' rx='2' /><path d='M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01' /></svg> </div>
              <div className="text-base md:text-lg font-bold mb-1">QR-Gated Access</div>
              <div className="text-sm md:text-base text-[#444]">Tickets are delivered as secure QR codes, eliminating the risk of counterfeit tickets and ensuring smooth entry.</div>
            </div>
            <div className="flex-1 bg-[#F5E7D6] rounded-2xl shadow p-5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-2"> <svg width='24' height='24' fill='none' stroke='#D6A77A' strokeWidth='2' viewBox='0 0 24 24'><circle cx='12' cy='12' r='10' /><path d='M12 6v6l4 2' /></svg> </div>
              <div className="text-base md:text-lg font-bold mb-1">Delayed Ticket Release</div>
              <div className="text-sm md:text-base text-[#444]">To enhance security, tickets are released closer to the event date, reducing risks associated with early transfers.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#222] mb-8">Loved by Users</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <TestimonialCard
            name="Priya Sharma"
            city="Mumbai, India"
            rating={5}
            text="Fastpass made buying tickets so easy and secure. I was able to get tickets to a sold-out concert without any worries! Definitely my go-to platform now."
          />
          <TestimonialCard
            name="Arjun Kapoor"
            city="Bangalore, India"
            rating={4.5}
            text="I resold my extra tickets on Fastpass and the process was seamless. Listing was quick, and I found a buyer in no time. Highly recommend!"
          />
        </div>
      </section>

      {/* Guarantee Banner */}
      <section className="w-full py-10 px-4 bg-[#F5E7D6] flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#222] mb-2 text-center">Our Unwavering Guarantee</h2>
          <p className="text-[#6B6B6B] text-center mb-6">
            We stand by the authenticity of every ticket. Our dedicated support team is always ready to assist you, ensuring a worry-free experience from purchase to event day.
          </p>
          <Link to="/events" className="px-8 py-3 rounded-full font-bold bg-[#D6A77A] text-white shadow hover:bg-[#b98a5e] transition text-lg">Explore Events Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-[#E5E5E5] py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="w-7 h-7 rounded-lg bg-[#D6A77A] flex items-center justify-center font-extrabold text-white text-lg">L</span>
            <span className="font-extrabold text-lg text-[#222] tracking-tight">Fastpass</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="text-[#6B6B6B] text-sm hover:text-[#D6A77A]">About Us</Link>
            <Link to="/contact" className="text-[#6B6B6B] text-sm hover:text-[#D6A77A]">Contact</Link>
            <Link to="/terms" className="text-[#6B6B6B] text-sm hover:text-[#D6A77A]">Terms of Service</Link>
            <Link to="/privacy" className="text-[#6B6B6B] text-sm hover:text-[#D6A77A]">Privacy Policy</Link>
            <Link to="/faq" className="text-[#6B6B6B] text-sm hover:text-[#D6A77A]">FAQ</Link>
          </div>
        </div>
        <div className="text-center text-xs text-[#A9A9A9] mt-4">
          © 2024 Fastpass India. All rights reserved. Your trusted partner for event tickets.
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 