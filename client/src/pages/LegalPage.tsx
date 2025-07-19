import React from 'react';
import { Link } from 'react-router-dom';

const LegalPage: React.FC = () => {

  const navItems = [
    { href: '/legal/terms', label: 'Terms of Service' },
    { href: '/legal/privacy', label: 'Privacy Policy' },
    { href: '/legal/refund', label: 'Refund Policy' },
    { href: '/legal/seller-agreement', label: 'Seller Agreement' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F6] font-sans">


      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-section-title font-display text-[#222] mb-6">
            Legal Policies
          </h1>
          <p className="text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose">
            Our commitment to transparency and your rights. Please read these policies carefully to understand your rights and obligations when using LayLow-India.
          </p>
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/legal/terms" className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-2xl font-display text-[#222] mb-4">Terms of Service</h2>
            <p className="text-body text-[#6B6B6B] mb-4">
              Learn about your rights and obligations when using LayLow-India platform.
            </p>
            <div className="text-[#D6A77A] font-semibold">Read More →</div>
          </Link>

          <Link to="/legal/privacy" className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-2xl font-display text-[#222] mb-4">Privacy Policy</h2>
            <p className="text-body text-[#6B6B6B] mb-4">
              Understand how we collect, use, and protect your personal information.
            </p>
            <div className="text-[#D6A77A] font-semibold">Read More →</div>
          </Link>

          <Link to="/legal/refund" className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-2xl font-display text-[#222] mb-4">Refund Policy</h2>
            <p className="text-body text-[#6B6B6B] mb-4">
              Our buyer-first refund policy ensures your satisfaction and protection.
            </p>
            <div className="text-[#D6A77A] font-semibold">Read More →</div>
          </Link>

          <Link to="/legal/seller-agreement" className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <h2 className="text-2xl font-display text-[#222] mb-4">Seller Agreement</h2>
            <p className="text-body text-[#6B6B6B] mb-4">
              Guidelines and obligations for sellers on LayLow-India platform.
            </p>
            <div className="text-[#D6A77A] font-semibold">Read More →</div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LegalPage; 