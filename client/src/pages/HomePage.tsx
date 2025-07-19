import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import custom CSS for flip effect
import { FaSearch, FaLock, FaRegSmile, FaUsers, FaTicketAlt, FaShieldAlt, FaCreditCard, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import FeedbackButton from '../components/common/FeedbackButton.tsx';
import { Event } from '../types/index.ts';
import { eventsAPI } from '../services/api.ts';

// Helper function to transform Event data for display
const transformEventForDisplay = (event: Event) => {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  // Generate badges based on event data
  const badges = ['🔥 Trending'];
  if (event._count?.tickets && event._count.tickets < 10) {
    badges.push(`⏳ Only ${event._count.tickets} left`);
  }
  
  // Calculate average price from tickets if available
  const avgPrice = event.tickets && event.tickets.length > 0 
    ? Math.round(event.tickets.reduce((sum, ticket) => sum + ticket.price, 0) / event.tickets.length)
    : 999;
  
  const originalPrice = Math.round(avgPrice * 1.3); // 30% markup for original price
  
  return {
    id: event.id,
    name: event.title,
    date: formattedDate,
    location: event.venue,
    image: event.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    price: avgPrice,
    badges,
    originalPrice,
    category: event.category,
    rating: 4.8, // Default rating
    soldCount: event._count?.tickets || 0
  };
};

// Static events for fallback
const staticEvents = [
  {
    id: 'static-1',
    name: 'Garba Night',
    date: 'Sept 17',
    location: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    price: 999,
    badges: ['🔥 Trending', '⏳ Only 4 left'],
    originalPrice: 1299,
    category: 'Cultural',
    rating: 4.8,
    soldCount: 156
  },
  {
    id: 'static-2',
    name: 'Music Festival',
    date: 'Oct 5',
    location: 'Bangalore',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    price: 1499,
    badges: ['🔥 Trending', '⏳ Only 2 left'],
    originalPrice: 1999,
    category: 'Music',
    rating: 4.9,
    soldCount: 89
  },
  {
    id: 'static-3',
    name: 'Comedy Club',
    date: 'Oct 20',
    location: 'Delhi',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    price: 799,
    badges: ['🔥 Trending', '⏳ Only 6 left'],
    originalPrice: 999,
    category: 'Comedy',
    rating: 4.7,
    soldCount: 234
  },
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

const TestimonialCard: React.FC<{ name: string; city: string; rating: number; text: string; img?: string }> = ({
  name, city, rating, text, img
}) => (
  <div className="bg-white rounded-2xl shadow p-5 flex flex-col items-start w-full max-w-md transition-transform transition-shadow duration-200 ease-in-out hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer">
    <div className="flex items-center mb-2">
      <div className="w-10 h-10 rounded-full bg-[#F5E7D6] flex items-center justify-center text-lg font-bold text-[#D6A77A] mr-3">
        {img ? <img src={img} alt={name} className="w-10 h-10 rounded-full" /> : name[0]}
      </div>
      <div>
        <div className="font-bold text-[#222]">{name}</div>
        <div className="text-xs text-[#A9A9A9]">{city}</div>
      </div>
    </div>
    <div className="flex items-center mb-2">
      <span className="text-[#D6A77A] text-base mr-1">
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 ? '½' : ''}
      </span>
      <span className="text-xs text-[#A9A9A9] ml-1">{rating}/5</span>
    </div>
    <div className="text-[#444] text-sm">{text}</div>
  </div>
);

// --- Main Home Page ---

// --- Main Home Page ---

function HowItWorks() {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const handleMouseEnter = (index: number) => {
    setFlippedCards(prev => [...prev, index]);
  };

  const handleMouseLeave = (index: number) => {
    setFlippedCards(prev => prev.filter(i => i !== index));
  };

  // Mobile support - toggle on touch
  const handleTouch = (index: number) => {
    setFlippedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Keyboard navigation support
  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTouch(index);
    }
  };

  const steps = [
    {
      icon: <FaSearch className="text-3xl text-[#FF6B35]" />,
      title: "Browse & Discover",
      description: "Find tickets to your favorite events with ease. Search by event, artist, or venue.",
      backTitle: "What You Can Do",
      backItems: [
        "Search by event, artist, or venue",
        "Filter by price and location", 
        "Real-time availability updates",
        "Compare prices instantly"
      ],
      gradient: "from-blue-400 to-purple-500",
      accentColor: "text-blue-500"
    },
    {
      icon: <FaLock className="text-3xl text-[#FF6B35]" />,
      title: "Secure Purchase",
      description: "All purchases are protected with bank-level security. Your data is always safe.",
      backTitle: "Security Features",
      backItems: [
        "SSL encrypted payments",
        "Instant ticket delivery",
        "Money-back guarantee",
        "PCI DSS compliant"
      ],
      gradient: "from-green-400 to-blue-500",
      accentColor: "text-green-500"
    },
    {
      icon: <FaRegSmile className="text-3xl text-[#FF6B35]" />,
      title: "Enjoy the Event",
      description: "Show your ticket at the event and enjoy! We make sure your entry is smooth.",
      backTitle: "What Happens Next",
      backItems: [
        "QR code ticket delivery",
        "Easy entry at venue",
        "24/7 support available",
        "Post-event feedback"
      ],
      gradient: "from-purple-400 to-pink-500",
      accentColor: "text-purple-500"
    }
  ];

  return (
    <section className="w-full py-8 md:py-16 bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5E7D6] relative overflow-hidden max-w-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-20 h-20 md:w-40 md:h-40 bg-gradient-to-br from-[#D6A77A]/10 to-[#FF6B35]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-16 h-16 md:w-32 md:h-32 bg-gradient-to-tr from-[#FF6B35]/10 to-[#D6A77A]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-10 h-10 md:w-20 md:h-20 bg-gradient-to-r from-[#D6A77A]/5 to-[#FF6B35]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 overflow-x-hidden">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-1 md:gap-2 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold mb-4 shadow-lg tracking-wide">
            <span className="animate-pulse">🚀</span>
            <span className="hidden sm:inline">Simple 3-Step Process</span>
            <span className="sm:hidden">3 Steps</span>
            <span className="animate-pulse">🚀</span>
          </div>
          <h2 className="text-2xl md:text-section-title font-display text-[#222] mb-4 bg-gradient-to-r from-[#222] via-[#D6A77A] to-[#FF6B35] bg-clip-text text-transparent px-2 md:px-0">
            How LayLow-India Works
          </h2>
          <p className="text-sm md:text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose px-2 md:px-0">
            Get your tickets in just three simple steps. Our platform makes buying and selling tickets effortless and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
              onTouchStart={() => handleTouch(index)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              tabIndex={0}
              role="button"
              aria-label={`${step.title} - ${flippedCards.includes(index) ? 'Showing details' : 'Click to see details'}`}
              aria-expanded={flippedCards.includes(index)}
            >
              {/* Connection line between cards */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] transform -translate-y-1/2 z-10"></div>
              )}

              {/* Flip Card Container */}
              <div 
                className={`relative w-full h-[250px] md:h-[300px] group-hover:-translate-y-2 transition-all duration-300 ease-in-out transform perspective-1000`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {/* Front of Card */}
                <div 
                  className={`absolute inset-0 w-full h-full rounded-3xl p-6 bg-gradient-to-br ${step.gradient} text-white shadow-xl relative overflow-hidden`}
                  style={{ 
                    transform: flippedCards.includes(index) ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    backfaceVisibility: 'hidden',
                    transition: 'transform 0.6s ease-in-out'
                  }}
                >
                  {/* Floating badge */}
                  <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white px-3 py-1 rounded-bl-3xl rounded-tr-3xl text-sm font-bold shadow-xl transform group-hover:scale-110 transition-transform duration-300 border-2 border-white">
                    Step {index + 1}
                  </div>

                  <div className="flex flex-col items-center justify-center h-full text-center px-2">
                    <h3 className="text-xl md:text-3xl font-display font-bold leading-tight">{step.title}</h3>
                  </div>
                </div>

                {/* Back of Card */}
                <div 
                  className={`absolute inset-0 w-full h-full rounded-3xl p-6 bg-white shadow-xl border border-gray-200`}
                  style={{ 
                    transform: flippedCards.includes(index) ? 'rotateY(0deg)' : 'rotateY(-180deg)',
                    backfaceVisibility: 'hidden',
                    transition: 'transform 0.6s ease-in-out'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <h4 className={`text-lg font-bold mb-4 ${step.accentColor}`}>{step.backTitle}</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {step.backItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <span className="text-[#D6A77A] mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-left">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Safety Cards Component
function SafetyCards() {
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const handleMouseEnter = (index: number) => {
    setFlippedCards(prev => [...prev, index]);
  };

  const handleMouseLeave = (index: number) => {
    setFlippedCards(prev => prev.filter(i => i !== index));
  };

  // Mobile support - toggle on touch
  const handleTouch = (index: number) => {
    setFlippedCards(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Keyboard navigation support
  const handleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTouch(index);
    }
  };

  const safetyFeatures = [
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="#D6A77A" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7c0 6 8 10 8 10z" />
          <path d="M9 11l2 2 4-4" />
        </svg>
      ),
      title: "Verified Sellers",
      description: "All sellers are thoroughly vetted to ensure authenticity and prevent fraud.",
      backTitle: "Verification Process",
      backItems: [
        "Identity verification required",
        "Background checks performed",
        "Seller rating system",
        "Document verification"
      ],
      gradient: "from-emerald-400 to-green-500",
      accentColor: "text-emerald-500",
      badge: "✅ Verified"
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="#D6A77A" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M12 12h.01" />
        </svg>
      ),
      title: "QR-Gated Access",
      description: "Tickets are delivered as secure QR codes, eliminating counterfeit risks.",
      backTitle: "QR Security Features",
      backItems: [
        "Unique QR codes per ticket",
        "Real-time validation",
        "Anti-counterfeit protection",
        "One-time use codes"
      ],
      gradient: "from-blue-400 to-indigo-500",
      accentColor: "text-blue-500",
      badge: "🔐 Secure"
    },
    {
      icon: (
        <svg width="32" height="32" fill="none" stroke="#D6A77A" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: "Delayed Ticket Release",
      description: "Tickets are released closer to the event date for enhanced security.",
      backTitle: "Timing Benefits",
      backItems: [
        "24-hour pre-event delivery",
        "Prevents ticket scalping",
        "Enhanced fraud prevention",
        "Reduces transfer risks"
      ],
      gradient: "from-purple-400 to-pink-500",
      accentColor: "text-purple-500",
      badge: "⏰ Timed"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
      {safetyFeatures.map((feature, index) => (
        <div 
          key={index}
          className="relative h-72 md:h-80 cursor-pointer group flex flex-col"
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={() => handleMouseLeave(index)}
          onTouchEnd={() => handleTouch(index)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          tabIndex={0}
          role="button"
          aria-label={`${feature.title} - ${flippedCards.includes(index) ? 'Showing details' : 'Click to see details'}`}
          aria-expanded={flippedCards.includes(index)}
        >
          {/* Floating badge */}
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white px-3 py-1 rounded-bl-3xl rounded-tr-3xl text-sm font-bold shadow-xl transform group-hover:scale-110 transition-transform duration-300 border-2 border-white">
            {feature.badge}
          </div>
          <div 
            className={`absolute w-full h-full transition-all duration-700 ease-in-out ${
              flippedCards.includes(index) 
                ? 'rotate-y-180 opacity-0' 
                : 'rotate-y-0 opacity-100'
            }`}
            style={{
              transform: flippedCards.includes(index) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              backfaceVisibility: 'hidden'
            }}
          >
                        {/* Front Side */}
            <div className="w-full h-full rounded-3xl p-4 md:p-6 flex flex-col items-center justify-between text-center border border-[#D6A77A]/20 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg md:text-card-title font-display text-[#222] mb-3 md:mb-4 group-hover:text-[#D6A77A] transition-colors duration-300">{feature.title}</h3>
                <p className="text-sm md:text-body text-[#6B6B6B] prose">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className={`absolute w-full h-full transition-all duration-700 ease-in-out ${
              flippedCards.includes(index) 
                ? 'rotate-y-0 opacity-100' 
                : 'rotate-y-180 opacity-0'
            }`}
            style={{
              transform: flippedCards.includes(index) ? 'rotateY(0deg)' : 'rotateY(180deg)',
              backfaceVisibility: 'hidden'
            }}
          >
                        {/* Back Side */}
            <div className={`w-full h-full rounded-3xl p-4 md:p-6 flex flex-col items-center justify-between text-center bg-gradient-to-br ${feature.gradient} text-white shadow-xl relative overflow-hidden`}>
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white rounded-full animate-ping"></div>
              </div>
              
              <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                <h3 className="text-lg md:text-card-title font-display mb-4 md:mb-6">{feature.backTitle}</h3>
                <div className="space-y-3 md:space-y-4 text-left">
                  {feature.backItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center group/item">
                      <span className="w-2 h-2 bg-white rounded-full mr-3 group-hover/item:scale-150 transition-transform duration-300"></span>
                      <span className="text-sm md:text-base group-hover/item:text-yellow-200 transition-colors duration-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
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
    <div className="bg-[#D6A77A] text-white py-1.5 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto flex items-center justify-center">
        <span className="text-xs font-medium animate-pulse mr-2">🔴 LIVE</span>
        <span className="text-xs">{liveTickerItems[currentIndex]}</span>
      </div>
    </div>
  );
};

// Add Social Proof Stats Component
const SocialProofStats: React.FC = () => (
  <section className="w-full py-6 bg-white border-b border-[#E5E5E5]">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
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
  <section className="w-full py-4 bg-[#FAF8F6]">
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
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
  <section className="w-full py-4 bg-white border-t border-[#E5E5E5]">
    <div className="max-w-5xl mx-auto px-4">
      <div className="text-center">
        <p className="text-sm text-[#A9A9A9] mb-2">Featured in</p>
        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 opacity-60">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(1); // Start at 1 to show first real ticket
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dynamicEvents, setDynamicEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch trending events from API
  useEffect(() => {
    const fetchTrendingEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const response = await eventsAPI.getAll({ limit: 6 }); // Get top 6 trending events
        if (response.data?.events) {
          setDynamicEvents(response.data.events);
        } else {
          setDynamicEvents([]);
        }
      } catch (err) {
        console.error('Error fetching trending events:', err);
        setEventsError('Failed to load trending events');
        setDynamicEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchTrendingEvents();
  }, []);

  // Handle scroll to top visibility and intersection observer
  useEffect(() => {
    let ticking = false;
    let lastScrollTop = 0;
    let scrollVelocity = 0;
    let lastScrollTime = Date.now();
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentTime = Date.now();
          const currentScrollTop = window.scrollY;
          const timeDiff = currentTime - lastScrollTime;
          
          // Calculate scroll velocity
          if (timeDiff > 0) {
            scrollVelocity = (currentScrollTop - lastScrollTop) / timeDiff;
          }
          
          setShowScrollTop(currentScrollTop > 400);
          
          // Calculate scroll progress
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = (currentScrollTop / docHeight) * 100;
          setScrollProgress(Math.min(scrollPercent, 100));
          
          // Set scrolling state
          setIsScrolling(true);
          
          // Clear previous timeout
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          
          // Set timeout to detect when scrolling stops
          scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
            scrollVelocity = 0;
          }, 150); // Adjust this value to control when scrolling is considered "stopped"
          
          lastScrollTop = currentScrollTop;
          lastScrollTime = currentTime;
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Prevent horizontal scrolling and snap back to center
    const handleHorizontalScroll = () => {
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      if (scrollLeft !== 0) {
        // Snap back to center horizontally
        window.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    };

    // More aggressive horizontal scroll prevention
    const preventWheelHorizontalScroll = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        // Snap back to center
        window.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    };

    // Intersection Observer for scroll animations with better performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              setVisibleSections(prev => new Set(prev).add(entry.target.id));
            });
          }
        });
      },
      { 
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5], 
        rootMargin: '0px 0px -100px 0px',
        root: null
      }
    );

    // Observe sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleHorizontalScroll);
    window.addEventListener('wheel', preventWheelHorizontalScroll, { passive: false });
    
    // Also prevent horizontal scroll on touch devices
    const preventTouchHorizontalScroll = (e: TouchEvent) => {
      const touch = e.touches[0];
      const startX = touch.clientX;
      
      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const diffX = Math.abs(currentX - startX);
        
        // If horizontal movement is detected, prevent it
        if (diffX > 10) {
          e.preventDefault();
        }
      };
      
      const handleTouchEnd = () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchstart', preventTouchHorizontalScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleHorizontalScroll);
      window.removeEventListener('wheel', preventWheelHorizontalScroll);
      document.removeEventListener('touchstart', preventTouchHorizontalScroll);
      observer.disconnect();
      
      // Cleanup timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Custom smooth scroll with easing
  const smoothScrollTo = (targetY: number, duration: number = 800) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      window.scrollTo(0, startY + distance * easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search term');
      return;
    }
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      // Simulate API call for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      // Navigate to events page with search query
      window.location.href = `/events?search=${encodeURIComponent(searchQuery.trim())}`;
    } catch (error) {
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const nextTicket = () => {
    if (isTransitioning) return;
    const displayEvents = dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents;
    
    setCurrentTicketIndex((prev) => {
      if (prev === displayEvents.length) {
        // When reaching the last real ticket, animate to the cloned first ticket
        setIsTransitioning(true);
        // After animation completes, instantly jump to the real first ticket
        setTimeout(() => {
          setCurrentTicketIndex(1);
          setIsTransitioning(false);
        }, 500);
        return displayEvents.length + 1; // This will show the cloned first ticket
      }
      return prev + 1;
    });
  };

  const prevTicket = () => {
    if (isTransitioning) return;
    const displayEvents = dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents;
    
    setCurrentTicketIndex((prev) => {
      if (prev === 1) {
        // When reaching the first real ticket, animate to the cloned last ticket
        setIsTransitioning(true);
        // After animation completes, instantly jump to the real last ticket
        setTimeout(() => {
          setCurrentTicketIndex(displayEvents.length);
          setIsTransitioning(false);
        }, 500);
        return 0; // This will show the cloned last ticket
      }
      return prev - 1;
    });
  };

  // Get the actual ticket index for dots (0-based)
  const getActualIndex = () => {
    const displayEvents = dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents;
    if (currentTicketIndex === 0) return displayEvents.length - 1; // Cloned last ticket
    if (currentTicketIndex === displayEvents.length + 1) return 0; // Cloned first ticket
    return currentTicketIndex - 1; // Real tickets
  };

  return (
    <div 
      className={`bg-[#FAF8F6] min-h-screen font-sans overflow-x-hidden momentum-scroll ${isScrolling ? 'scrolling' : 'scrolled'}`} 
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Live Ticker */}
      <LiveTicker />
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[420px] md:h-[480px] lg:h-[560px] flex items-center justify-center overflow-hidden max-w-full">
        <img
          src="/concert-hero.png"
          alt="Concert Crowd"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 1 }}
          loading="eager"
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.opacity = '1';
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 py-8 bg-black/40">
          <h1 className="text-hero font-display text-white text-center mb-2 md:mb-3 drop-shadow">
            Get Sold-Out Tickets at Fair Prices
          </h1>
          <p className="text-body-large text-white text-center mb-2 md:mb-3 max-w-2xl drop-shadow">
            100% Verified & Secure • No Hidden Fees • Instant QR Codes
          </p>
          <p className="text-body text-white text-center mb-4 md:mb-6 max-w-2xl drop-shadow opacity-90 prose">
            India's most trusted platform for buying and selling event tickets with complete peace of mind.
          </p>
          <form onSubmit={handleSearch} className="w-full max-w-md flex flex-col items-center bg-white rounded-full shadow-md px-4 py-2 mb-2 md:mb-3">
            <div className="w-full flex items-center">
              <FaSearch className="text-[#D6A77A] text-lg mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (searchError) setSearchError('');
                }}
                placeholder="Search events, artists, or venues..."
                className="flex-1 bg-transparent outline-none text-[#222] placeholder-[#A9A9A9] text-base"
                disabled={isSearching}
                aria-label="Search for events, artists, or venues"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="ml-2 px-4 py-1 bg-[#D6A77A] text-white rounded-full text-sm font-semibold hover:bg-[#b98a5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label={isSearching ? "Searching..." : "Search"}
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            {searchError && (
              <div className="w-full mt-2 text-red-500 text-sm text-center" role="alert">
                {searchError}
              </div>
            )}
          </form>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 items-center">
            <Link to="/events" className="px-6 py-2.5 rounded-full font-bold bg-[#D6A77A] text-white shadow hover:bg-[#b98a5e] transition-transform duration-150 hover:scale-105 active:scale-95 text-base">Browse Events</Link>
            <Link to="/sell-ticket" className="px-6 py-2.5 rounded-full font-bold bg-transparent border-2 border-white text-white shadow hover:bg-white hover:text-[#222] transition-all duration-150 hover:scale-105 active:scale-95 text-base flex items-center gap-2">
              <span>📤</span>
              List My Ticket
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Tickets section */}
      <section 
        id="trending-tickets" 
        className={`w-full max-w-5xl mx-auto py-12 px-4 transition-all duration-1000 ${
          visibleSections.has('trending-tickets') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h2 className="text-section-title font-display text-[#222] mb-6 text-center">Trending Tickets</h2>
        
        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {(dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents).map((event, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-3 group cursor-pointer transform-gpu"
              style={{
                animationDelay: `${idx * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Badges */}
              <div className="w-full flex flex-wrap gap-2 mb-3">
                {event.badges.map((badge, badgeIdx) => (
                  <span key={badgeIdx} className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] text-white shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
              
              {/* Image with overlay */}
              <div className="relative w-full mb-3 overflow-hidden rounded-xl">
                <img
                  src={event.image}
                  alt={`Event: ${event.name} in ${event.location}`}
                  loading="lazy"
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Event Details */}
              <div className="w-full text-center">
                <div className="text-card-title font-display text-[#222] mb-1 group-hover:text-[#D6A77A] transition-colors duration-300">{event.name}</div>
                <div className="text-caption mb-2 flex items-center justify-center gap-2">
                  <span>{event.date} • {event.location}</span>
                  <span className="px-2 py-1 bg-[#F5E7D6] text-[#D6A77A] text-xs rounded-full font-medium">
                    {event.category}
                  </span>
                </div>
                
                {/* Rating and Sold Count */}
                <div className="flex items-center justify-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-[#D6A77A]">★</span>
                    <span className="text-[#6B6B6B]">{event.rating}</span>
                  </div>
                  <div className="text-[#6B6B6B]">
                    {event.soldCount} sold
                  </div>
                </div>
                
                {/* Price Section */}
                <div className="mb-3">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-3xl font-black text-[#D6A77A] group-hover:text-[#FF6B35] transition-colors duration-300">₹{event.price}</span>
                    <span className="text-lg text-[#A9A9A9] line-through">₹{event.originalPrice}</span>
                  </div>
                  <div className="text-xs text-[#D6A77A] font-semibold bg-[#F5E7D6] px-2 py-1 rounded-full inline-block">
                    {Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100)}% OFF
                  </div>
                </div>
                
                {/* CTA Button */}
                <Link 
                  to="/events" 
                  className="w-full px-6 py-3 rounded-full font-bold bg-[#FF6B35] text-white shadow-lg hover:bg-[#E55A2B] hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-base group-hover:shadow-[0_10px_25px_rgba(255,107,53,0.4)] flex items-center justify-center gap-2"
                >
                  <span>🎟️</span>
                  Buy Ticket
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Carousel Layout */}
        <div className="md:hidden relative w-full">
          <div className="relative overflow-hidden rounded-2xl w-full">
            <div 
              className={`flex w-full ${isTransitioning ? '' : 'transition-transform duration-500 ease-in-out'}`}
              style={{ 
                transform: `translateX(-${currentTicketIndex * 100}%)`,
                transition: isTransitioning ? 'none' : 'transform 500ms ease-in-out'
              }}
            >
              {/* Clone of last ticket at the beginning for seamless loop */}
              {(dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents).slice(-1).map((event, idx) => (
                <div 
                  key={`clone-last-${idx}`} 
                  className="w-full flex-shrink-0 bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center"
                >
                  {/* Badges */}
                  <div className="w-full flex flex-wrap gap-2 mb-3">
                    {event.badges.map((badge, badgeIdx) => (
                      <span key={badgeIdx} className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] text-white shadow-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  {/* Image with overlay */}
                  <div className="relative w-full mb-3 overflow-hidden rounded-xl">
                    <img
                      src={event.image}
                      alt={`Event: ${event.name} in ${event.location}`}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  
                  {/* Event Details */}
                  <div className="w-full text-center">
                    <div className="text-card-title font-display text-[#222] mb-1">{event.name}</div>
                    <div className="text-caption mb-2 flex items-center justify-center gap-2">
                      <span>{event.date} • {event.location}</span>
                      <span className="px-2 py-1 bg-[#F5E7D6] text-[#D6A77A] text-xs rounded-full font-medium">
                        {event.category}
                      </span>
                    </div>
                    
                    {/* Rating and Sold Count */}
                    <div className="flex items-center justify-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-[#D6A77A]">★</span>
                        <span className="text-[#6B6B6B]">{event.rating}</span>
                      </div>
                      <div className="text-[#6B6B6B]">
                        {event.soldCount} sold
                      </div>
                    </div>
                    
                    {/* Price Section */}
                    <div className="mb-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl font-black text-[#D6A77A]">₹{event.price}</span>
                        <span className="text-lg text-[#A9A9A9] line-through">₹{event.originalPrice}</span>
                      </div>
                      <div className="text-xs text-[#D6A77A] font-semibold bg-[#F5E7D6] px-2 py-1 rounded-full inline-block">
                        {Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100)}% OFF
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <Link 
                      to="/events" 
                      className="w-full px-6 py-3 rounded-full font-bold bg-[#FF6B35] text-white shadow-lg hover:bg-[#E55A2B] transition-all duration-300 active:scale-95 text-base flex items-center justify-center gap-2"
                    >
                      <span>🎟️</span>
                      Buy Ticket
                    </Link>
                  </div>
                </div>
              ))}

              {/* Original tickets */}
              {(dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents).map((event, idx) => (
                <div 
                  key={idx} 
                  className="w-full flex-shrink-0 bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center"
                >
                  {/* Badges */}
                  <div className="w-full flex flex-wrap gap-2 mb-3">
                    {event.badges.map((badge, badgeIdx) => (
                      <span key={badgeIdx} className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] text-white shadow-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  {/* Image with overlay */}
                  <div className="relative w-full mb-3 overflow-hidden rounded-xl">
                    <img
                      src={event.image}
                      alt={`Event: ${event.name} in ${event.location}`}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  
                  {/* Event Details */}
                  <div className="w-full text-center">
                    <div className="text-card-title font-display text-[#222] mb-1">{event.name}</div>
                    <div className="text-caption mb-2 flex items-center justify-center gap-2">
                      <span>{event.date} • {event.location}</span>
                      <span className="px-2 py-1 bg-[#F5E7D6] text-[#D6A77A] text-xs rounded-full font-medium">
                        {event.category}
                      </span>
                    </div>
                    
                    {/* Rating and Sold Count */}
                    <div className="flex items-center justify-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-[#D6A77A]">★</span>
                        <span className="text-[#6B6B6B]">{event.rating}</span>
                      </div>
                      <div className="text-[#6B6B6B]">
                        {event.soldCount} sold
                      </div>
                    </div>
                    
                    {/* Price Section */}
                    <div className="mb-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl font-black text-[#D6A77A]">₹{event.price}</span>
                        <span className="text-lg text-[#A9A9A9] line-through">₹{event.originalPrice}</span>
                      </div>
                      <div className="text-xs text-[#D6A77A] font-semibold bg-[#F5E7D6] px-2 py-1 rounded-full inline-block">
                        {Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100)}% OFF
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <Link 
                      to="/events" 
                      className="w-full px-6 py-3 rounded-full font-bold bg-[#FF6B35] text-white shadow-lg hover:bg-[#E55A2B] transition-all duration-300 active:scale-95 text-base flex items-center justify-center gap-2"
                    >
                      <span>🎟️</span>
                      Buy Ticket
                    </Link>
                  </div>
                </div>
              ))}

              {/* Clone of first ticket at the end for seamless loop */}
              {(dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents).slice(0, 1).map((event, idx) => (
                <div 
                  key={`clone-first-${idx}`} 
                  className="w-full flex-shrink-0 bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center"
                >
                  {/* Badges */}
                  <div className="w-full flex flex-wrap gap-2 mb-3">
                    {event.badges.map((badge, badgeIdx) => (
                      <span key={badgeIdx} className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] text-white shadow-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  {/* Image with overlay */}
                  <div className="relative w-full mb-3 overflow-hidden rounded-xl">
                    <img
                      src={event.image}
                      alt={`Event: ${event.name} in ${event.location}`}
                      loading="lazy"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  
                  {/* Event Details */}
                  <div className="w-full text-center">
                    <div className="text-card-title font-display text-[#222] mb-1">{event.name}</div>
                    <div className="text-caption mb-2 flex items-center justify-center gap-2">
                      <span>{event.date} • {event.location}</span>
                      <span className="px-2 py-1 bg-[#F5E7D6] text-[#D6A77A] text-xs rounded-full font-medium">
                        {event.category}
                      </span>
                    </div>
                    
                    {/* Rating and Sold Count */}
                    <div className="flex items-center justify-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-[#D6A77A]">★</span>
                        <span className="text-[#6B6B6B]">{event.rating}</span>
                      </div>
                      <div className="text-[#6B6B6B]">
                        {event.soldCount} sold
                      </div>
                    </div>
                    
                    {/* Price Section */}
                    <div className="mb-3">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-3xl font-black text-[#D6A77A]">₹{event.price}</span>
                        <span className="text-lg text-[#A9A9A9] line-through">₹{event.originalPrice}</span>
                      </div>
                      <div className="text-xs text-[#D6A77A] font-semibold bg-[#F5E7D6] px-2 py-1 rounded-full inline-block">
                        {Math.round(((event.originalPrice - event.price) / event.originalPrice) * 100)}% OFF
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <Link 
                      to="/events" 
                      className="w-full px-6 py-3 rounded-full font-bold bg-[#FF6B35] text-white shadow-lg hover:bg-[#E55A2B] transition-all duration-300 active:scale-95 text-base flex items-center justify-center gap-2"
                    >
                      <span>🎟️</span>
                      Buy Ticket
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Navigation */}
          <div className="flex items-center justify-between mt-6 w-full px-2">
            <button
              onClick={prevTicket}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#D6A77A] hover:bg-[#D6A77A] hover:text-white transition-all duration-300"
              aria-label="Previous ticket"
            >
              <FaChevronLeft className="text-lg" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex gap-2">
              {(dynamicEvents.length > 0 ? dynamicEvents.map(transformEventForDisplay) : staticEvents).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTicketIndex(idx + 1)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx === getActualIndex()
                      ? 'bg-[#D6A77A] scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to ticket ${idx + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTicket}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#D6A77A] hover:bg-[#D6A77A] hover:text-white transition-all duration-300"
              aria-label="Next ticket"
            >
              <FaChevronRight className="text-lg" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works (Moved up from section 7) */}
      <HowItWorks />

      {/* Safety Section (Moved up from section 8) */}
      <section 
        id="safety-section"
        className={`w-full py-8 bg-gradient-to-br from-white via-[#FAF8F6] to-white relative overflow-hidden transition-all duration-1000 ${
          visibleSections.has('safety-section') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-[#D6A77A]/10 to-[#FF6B35]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-tl from-[#FF6B35]/10 to-[#D6A77A]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-r from-[#D6A77A]/5 to-[#FF6B35]/5 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10 overflow-x-hidden">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg tracking-wide">
              <span className="animate-pulse">🛡️</span>
              Multi-Layer Security
              <span className="animate-pulse">🛡️</span>
            </div>
            <h2 className="text-section-title font-display text-[#222] mb-4 bg-gradient-to-r from-[#222] via-[#D6A77A] to-[#FF6B35] bg-clip-text text-transparent">
              Your Safety is Our Priority
            </h2>
            <p className="text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose">
              We've built multiple layers of security. Hover or tap each card to see our detailed safety measures.
            </p>
          </div>
          
                    <SafetyCards />
          
          {/* Bottom spacing */}
          <div className="mt-12"></div>
        </div>
      </section>



      {/* Testimonials */}
      <section className="w-full max-w-5xl mx-auto py-10 px-4">
        <h2 className="text-section-title font-display text-[#222] mb-6">Loved by Users</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <TestimonialCard
            name="Priya Sharma"
            city="Mumbai, India"
            rating={5}
            text="LayLow-India made buying tickets so easy and secure. I was able to get tickets to a sold-out concert without any worries! Definitely my go-to platform now."
          />
          <TestimonialCard
            name="Arjun Kapoor"
            city="Bangalore, India"
            rating={4.5}
            text="I resold my extra tickets on LayLow-India and the process was seamless. Listing was quick, and I found a buyer in no time. Highly recommend!"
          />
        </div>
      </section>

      {/* Quick FAQ Section */}
      <section className="w-full max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-section-title font-display text-[#222] mb-4">Still Have Questions?</h2>
          <p className="text-body-large text-[#6B6B6B]">Here are some quick answers:</p>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-6">
            <h3 className="text-card-title font-display text-[#222] mb-3">
              How do I know the tickets are genuine?
            </h3>
            <p className="text-body text-[#6B6B6B]">
              All tickets on LayLow-India are verified through our multi-step authentication process. We use QR code verification, seller KYC, and escrow payments to ensure authenticity. If any ticket is found to be fake, you get a full refund.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-6">
            <h3 className="text-card-title font-display text-[#222] mb-3">
              What if the event gets cancelled?
            </h3>
            <p className="text-body text-[#6B6B6B]">
              If an event is cancelled or significantly altered, you're eligible for a full refund. We process refunds within 5-7 working days to your original payment method. Our team monitors all events and automatically notifies affected users.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-6">
            <h3 className="text-card-title font-display text-[#222] mb-3">
              How quickly can I get my tickets?
            </h3>
            <p className="text-body text-[#6B6B6B]">
              Most tickets are delivered instantly via QR code to your email and phone. For physical tickets, we offer express delivery options. You can also access your tickets anytime through your LayLow-India account.
            </p>
          </div>
        </div>
        
        <div className="text-right mt-8">
          <Link 
            to="/faq" 
            className="inline-flex items-center space-x-2 text-[#D6A77A] hover:text-[#b98a5e] transition-colors font-semibold text-base"
          >
            <span>See All FAQs</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Guarantee Banner */}
      <section className="w-full py-8 px-4 bg-[#F5E7D6] flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full flex flex-col items-center">
          <h2 className="text-section-title font-display text-[#222] mb-2 text-center">Our Unwavering Guarantee</h2>
          <p className="text-body text-[#6B6B6B] text-center mb-4 prose">
            We stand by the authenticity of every ticket. Our dedicated support team is always ready to assist you, ensuring a worry-free experience from purchase to event day.
          </p>
          <Link to="/events" className="px-6 py-2.5 rounded-full font-bold bg-[#D6A77A] text-white shadow hover:bg-[#b98a5e] transition text-base">Explore Events Now</Link>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        {/* Desktop: Always show all buttons */}
        <div className="hidden md:flex flex-col gap-3">
          <Link
            to="/sell-ticket"
            className="w-14 h-14 bg-[#FF6B35] text-white rounded-full shadow-xl hover:bg-[#E55A2B] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group border-2 border-white"
            aria-label="Sell your ticket"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">📤</span>
          </Link>
          <Link
            to="/events"
            className="w-14 h-14 bg-[#D6A77A] text-white rounded-full shadow-xl hover:bg-[#b98a5e] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group border-2 border-white"
            aria-label="Browse events"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🎟️</span>
          </Link>
                                             <FeedbackButton
               variant="button"
               className="!w-14 !h-14 !bg-[#4A90E2] !text-white !rounded-full !shadow-xl hover:!bg-[#357ABD] !transition-all !duration-300 hover:!scale-110 active:!scale-95 !flex !items-center !justify-center group !border-2 !border-white !p-0 !min-w-0"
             >
               <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">📝</span>
             </FeedbackButton>
        </div>

        {/* Mobile: Expandable FAB */}
        <div className="md:hidden relative">
          {/* Expanded buttons */}
          <div className={`absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-500 ease-in-out ${isFabExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <Link
              to="/sell-ticket"
              className="w-14 h-14 bg-[#FF6B35] text-white rounded-full shadow-xl hover:bg-[#E55A2B] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group border-2 border-white"
              aria-label="Sell your ticket"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">📤</span>
            </Link>
            <Link
              to="/events"
              className="w-14 h-14 bg-[#D6A77A] text-white rounded-full shadow-xl hover:bg-[#b98a5e] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group border-2 border-white"
              aria-label="Browse events"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🎟️</span>
            </Link>
            <FeedbackButton
              variant="button"
              className="!w-14 !h-14 !bg-[#4A90E2] !text-white !rounded-full !shadow-xl hover:!bg-[#357ABD] !transition-all !duration-300 hover:!scale-110 active:!scale-95 !flex !items-center !justify-center group !border-2 !border-white !p-0 !min-w-0"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">📝</span>
            </FeedbackButton>
          </div>

          {/* Main FAB button */}
          <button
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className="w-14 h-14 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white relative z-10"
            aria-label="Quick actions"
          >
            <svg 
              width="24" 
              height="24" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              className={`transition-transform duration-300 ${isFabExpanded ? 'rotate-45' : 'rotate-0'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Scroll to Top Button - Positioned separately to avoid overlap */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-[#D6A77A] text-white rounded-full shadow-xl hover:bg-[#b98a5e] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white"
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" className="md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HomePage; 