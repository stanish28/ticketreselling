import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; // Import custom CSS for flip effect
import { FaSearch, FaLock, FaRegSmile, FaUsers, FaTicketAlt, FaShieldAlt, FaCreditCard } from "react-icons/fa";
import { Event, Ticket } from '../types';
import { eventsAPI } from '../services/api.ts';



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
    <section className="w-full py-16 bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5E7D6] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#D6A77A]/10 to-[#FF6B35]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-[#FF6B35]/10 to-[#D6A77A]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-to-r from-[#D6A77A]/5 to-[#FF6B35]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg tracking-wide">
            <span className="animate-pulse">🚀</span>
            Simple 3-Step Process
            <span className="animate-pulse">🚀</span>
          </div>
          <h2 className="text-section-title font-display text-[#222] mb-4 bg-gradient-to-r from-[#222] via-[#D6A77A] to-[#FF6B35] bg-clip-text text-transparent">
            How LayLow-India Works
          </h2>
          <p className="text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose">
            Get your tickets in just three simple steps. Our platform makes buying and selling tickets effortless and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                className={`relative w-full h-[300px] group-hover:-translate-y-2 transition-all duration-300 ease-in-out transform perspective-1000`}
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

                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <h3 className="text-3xl font-display font-bold">{step.title}</h3>
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
  const safetyFeatures = [
    {
      icon: "🛡️",
      title: "Verified Sellers",
      description: "All sellers are thoroughly vetted",
      badge: "✅ Verified",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    {
      icon: "🔐",
      title: "QR-Gated Access",
      description: "Secure QR codes eliminate counterfeits",
      badge: "🔒 Secure",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: "⏰",
      title: "Delayed Release",
      description: "Tickets released closer to event date",
      badge: "⏱️ Timed",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: "💰",
      title: "Money-Back Guarantee",
      description: "100% refund if not satisfied",
      badge: "💯 Guaranteed",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <section className="w-full py-16 bg-gradient-to-br from-white via-[#FAF8F6] to-[#F5E7D6] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-[#FF6B35]/10 to-[#D6A77A]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-tr from-[#D6A77A]/10 to-[#FF6B35]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-r from-[#FF6B35]/5 to-[#D6A77A]/5 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#D6A77A] text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-lg tracking-wide">
            <span className="animate-pulse">🛡️</span>
            Multi-Layer Security
            <span className="animate-pulse">🛡️</span>
          </div>
          <h2 className="text-section-title font-display text-[#222] mb-4 bg-gradient-to-r from-[#222] via-[#FF6B35] to-[#D6A77A] bg-clip-text text-transparent">
            Your Safety is Our Priority
          </h2>
          <p className="text-body-large text-[#6B6B6B] max-w-2xl mx-auto">
            Multiple layers of security ensure your ticket buying experience is completely safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safetyFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ease-out transform-gpu"
            >
              {/* Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#FF6B35] to-[#D6A77A] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                {feature.badge}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-full ${feature.bgColor} ${feature.borderColor} border-2 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>

              {/* Content */}
              <h3 className={`text-xl font-bold text-[#222] mb-2 ${feature.color}`}>
                {feature.title}
              </h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Add Live Ticker Component


// Add Social Proof Stats Component
const SocialProofStats: React.FC = () => (
  <section className="w-full py-12 bg-white">
    <div className="max-w-6xl mx-auto px-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-[#D6A77A] mb-2">50,000+</div>
          <div className="text-sm text-[#6B6B6B] font-medium">Happy Users</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-[#D6A77A] mb-2">1,247</div>
          <div className="text-sm text-[#6B6B6B] font-medium">Tickets Sold</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-[#D6A77A] mb-2">99.8%</div>
          <div className="text-sm text-[#6B6B6B] font-medium">Trust Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-[#D6A77A] mb-2">24/7</div>
          <div className="text-sm text-[#6B6B6B] font-medium">Support</div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-8">
        <div className="flex items-center gap-2 bg-[#FAF8F6] px-4 py-2 rounded-full">
          <span className="text-[#D6A77A]">🔒</span>
          <span className="text-sm font-medium text-[#6B6B6B]">256-bit SSL</span>
        </div>
        <div className="flex items-center gap-2 bg-[#FAF8F6] px-4 py-2 rounded-full">
          <span className="text-[#D6A77A]">💳</span>
          <span className="text-sm font-medium text-[#6B6B6B]">Secure Payments</span>
        </div>
        <div className="flex items-center gap-2 bg-[#FAF8F6] px-4 py-2 rounded-full">
          <span className="text-[#D6A77A]">✅</span>
          <span className="text-sm font-medium text-[#6B6B6B]">Verified Tickets</span>
        </div>
        <div className="flex items-center gap-2 bg-[#FAF8F6] px-4 py-2 rounded-full">
          <span className="text-[#D6A77A]">💰</span>
          <span className="text-sm font-medium text-[#6B6B6B]">Money-back Guarantee</span>
        </div>
      </div>

      {/* Press Mentions */}
      <div className="text-center">
        <p className="text-sm text-[#A9A9A9] mb-3">Featured in</p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 opacity-70">
          <span className="text-lg font-bold text-[#6B6B6B]">Economic Times</span>
          <span className="text-lg font-bold text-[#6B6B6B]">YourStory</span>
          <span className="text-lg font-bold text-[#6B6B6B]">TechCrunch India</span>
          <span className="text-lg font-bold text-[#6B6B6B]">Inc42</span>
        </div>
      </div>
    </div>
  </section>
);



// Helper function to transform Event data for display (moved outside component)
const transformEventForDisplay = (event: Event) => {
  // Handle events without tickets - use mock data for display
  const availableTickets = event.tickets?.filter(t => t.status === 'AVAILABLE').length || 0;
  const totalTickets = event.tickets?.length || 0;
  const soldTickets = totalTickets - availableTickets;
  
  // Get the lowest price from available tickets, or use mock price if no tickets
  const availableTicketPrices = event.tickets
    ?.filter(t => t.status === 'AVAILABLE')
    .map(t => t.price) || [];
  const minPrice = availableTicketPrices.length > 0 ? Math.min(...availableTicketPrices) : 1500; // Default price if no tickets
  
  // Calculate a mock original price (20% higher for demo)
  const originalPrice = Math.round(minPrice * 1.2);
  
  // Generate badges based on event data
  const badges: string[] = [];
  if (availableTickets <= 5 && availableTickets > 0) badges.push('⏳ Only ' + availableTickets + ' left');
  if (soldTickets > 50) badges.push('🔥 Trending');
  if (!event.tickets || event.tickets.length === 0) {
    badges.push('📅 Coming Soon');
  } else {
    badges.push('✅ Verified Seller');
  }
  
  // Format date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return {
    ...event,
    displayName: event.title,
    displayDate: formattedDate,
    displayLocation: event.venue,
    displayPrice: minPrice,
    displayOriginalPrice: originalPrice,
    displaySoldCount: soldTickets,
    displayRating: 4.5 + (Math.random() * 0.5), // Mock rating
    displayBadges: badges,
    displayImage: event.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80'
  };
};

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle scroll to top visibility and intersection observer
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      // Calculate scroll progress
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(scrollPercent, 100));
    };

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => observer.observe(section));

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getAll({ limit: 6 });
        
        if (response.success && response.data?.events) {
          setEvents(response.data.events);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to fetch events.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-center py-16">Loading...</div>;
  }

  if (error) {
    console.log('Showing error state, but continuing with empty events array');
  }

  return (
    <div className="bg-[#FAF8F6] min-h-screen font-sans">
      {/* Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#D6A77A] to-[#FF6B35] transition-all duration-300 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      

      
      {/* Hero Section */}
      <section className="relative w-full h-[380px] md:h-[480px] lg:h-[560px] flex items-center justify-center overflow-hidden">
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
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 pb-8 bg-black/40">
          <h1 className="text-hero font-display text-white text-center mb-3 drop-shadow">
            Get Sold-Out Tickets at Fair Prices
          </h1>
          <p className="text-body-large text-white text-center mb-3 max-w-2xl drop-shadow">
            100% Verified & Secure • No Hidden Fees • Instant QR Codes
          </p>
          <p className="text-body text-white text-center mb-6 max-w-2xl drop-shadow opacity-90 prose">
            India's most trusted platform for buying and selling event tickets with complete peace of mind.
          </p>
          <form onSubmit={handleSearch} className="w-full max-w-md flex flex-col items-center bg-white rounded-full shadow-md px-4 py-2 mb-3">
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
          <div className="flex flex-col sm:flex-row gap-3 items-center">
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
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-[#6B6B6B] mb-2">No Events Available</h3>
            <p className="text-[#A9A9A9] mb-6">Check back soon for exciting events!</p>
            {error && (
              <div className="text-sm text-red-500 mb-4">
                Error: {error}
              </div>
            )}
            <Link 
              to="/events" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-[#D6A77A] text-white shadow hover:bg-[#b98a5e] transition-colors"
            >
              <span>🔍</span>
              Browse All Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((event, idx) => {
              const displayEvent = transformEventForDisplay(event);
              return (
              <div 
                key={event.id} 
                className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-3 group cursor-pointer transform-gpu"
                style={{
                  animationDelay: `${idx * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Badges */}
                <div className="w-full flex flex-wrap gap-2 mb-3">
                  {displayEvent.displayBadges.map((badge, badgeIdx) => (
                    <span key={badgeIdx} className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] text-white shadow-sm">
                      {badge}
                    </span>
                  ))}
                </div>
                
                {/* Image with overlay */}
                <div className="relative w-full mb-3 overflow-hidden rounded-xl">
                  <img
                    src={displayEvent.displayImage}
                    alt={`Event: ${displayEvent.displayName} in ${displayEvent.displayLocation}`}
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
                  <div className="text-card-title font-display text-[#222] mb-1 group-hover:text-[#D6A77A] transition-colors duration-300">{displayEvent.displayName}</div>
                  <div className="text-caption mb-2 flex items-center justify-center gap-2">
                    <span>{displayEvent.displayDate} • {displayEvent.displayLocation}</span>
                    <span className="px-2 py-1 bg-[#F5E7D6] text-[#D6A77A] text-xs rounded-full font-medium">
                      {displayEvent.category}
                    </span>
                  </div>
                  
                  {/* Rating and Sold Count */}
                  <div className="flex items-center justify-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-[#D6A77A]">★</span>
                      <span className="text-[#6B6B6B]">{displayEvent.displayRating.toFixed(1)}</span>
                    </div>
                    <div className="text-[#6B6B6B]">
                      {displayEvent.displaySoldCount} sold
                    </div>
                  </div>
                  
                  {/* Price Section */}
                  <div className="mb-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-3xl font-black text-[#D6A77A] group-hover:text-[#FF6B35] transition-colors duration-300">₹{displayEvent.displayPrice}</span>
                      <span className="text-lg text-[#A9A9A9] line-through">₹{displayEvent.displayOriginalPrice}</span>
                    </div>
                    <div className="text-xs text-[#D6A77A] font-semibold bg-[#F5E7D6] px-2 py-1 rounded-full inline-block">
                      {Math.round(((displayEvent.displayOriginalPrice - displayEvent.displayPrice) / displayEvent.displayOriginalPrice) * 100)}% OFF
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Link 
                    to={`/events/${event.id}`}
                    className="w-full px-6 py-3 rounded-full font-bold bg-[#FF6B35] text-white shadow-lg hover:bg-[#E55A2B] hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-base group-hover:shadow-[0_10px_25px_rgba(255,107,53,0.4)] flex items-center justify-center gap-2"
                  >
                    <span>🎟️</span>
                    Buy Ticket
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </section>

      {/* How It Works (Moved up from section 7) */}
      <HowItWorks />

      {/* Safety Section (Moved up from section 8) */}
      <SafetyCards />

      {/* Social Proof Stats */}
      <SocialProofStats />

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
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col gap-3">
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
          <button
            onClick={() => window.open('mailto:feedback@laylow-india.com?subject=Feedback for LayLow-India', '_blank')}
            className="w-14 h-14 bg-[#4A90E2] text-white rounded-full shadow-xl hover:bg-[#357ABD] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group border-2 border-white"
            aria-label="Send feedback"
          >
            <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">💬</span>
          </button>
        </div>
      </div>
      
      {/* Scroll to Top Button - Positioned separately to avoid overlap */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#D6A77A] text-white rounded-full shadow-xl hover:bg-[#b98a5e] transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center border-2 border-white"
          aria-label="Scroll to top"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HomePage; 