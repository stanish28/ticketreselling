import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDownload, FaChevronLeft } from 'react-icons/fa';

const LegalPage: React.FC = () => {
  useEffect(() => {
    // Smooth scroll behavior for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.substring(1);
        const element = document.getElementById(id || '');
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const handleDownloadPDF = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = '/LayLow_India_Legal_Policies_2025.pdf';
    link.download = 'LayLow_India_Legal_Policies_2025.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { href: '#terms-of-service', label: 'Terms of Service' },
    { href: '#privacy-policy', label: 'Privacy Policy' },
    { href: '#refund-policy', label: 'Refund Policy' },
    { href: '#seller-agreement', label: 'Seller Agreement' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F6] font-sans">
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-lg bg-[#D6A77A] flex items-center justify-center font-bold text-white text-base">L</span>
              <span className="font-display font-bold text-xl text-[#222]">LayLow-India</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-12">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-base font-semibold text-[#6B6B6B] hover:text-[#D6A77A] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 text-[#6B6B6B] hover:text-[#D6A77A] transition-colors text-sm"
            >
              <FaDownload className="text-xs" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 overflow-x-auto">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-base font-semibold text-[#6B6B6B] hover:text-[#D6A77A] transition-colors whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

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
          <div className="mt-8">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center space-x-2 px-6 py-3 text-[#D6A77A] hover:text-[#b98a5e] transition-colors text-base font-medium"
            >
              <FaDownload className="text-sm" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Terms of Service Section */}
        <section id="terms-of-service" className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
            <h2 className="text-section-title font-display text-[#222] mb-6">
              Terms of Service
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-sm text-[#A9A9A9] mb-6">
                Last Updated: January 2025
              </p>
              <p className="text-body text-[#6B6B6B] mb-6">
                By accessing or using LayLow-India, you agree to be bound by these Terms of Service in accordance with applicable Indian laws. If you do not agree with any part of the terms, please do not use our platform.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Eligibility</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Users must be 18+ and capable of entering a legally binding agreement under the Indian Contract Act, 1872.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Use of Platform</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                LayLow-India is a digital intermediary facilitating peer-to-peer ticket resale in accordance with the Information Technology Act, 2000. We do not own, issue, or guarantee the performance of tickets.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">User Responsibilities</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                You are responsible for the accuracy of all information provided and for maintaining the confidentiality of your account.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Prohibited Conduct</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Activities such as fraud, impersonation, reselling tickets above face value where prohibited, and circumvention of event policies are strictly banned.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Compliance with Local Laws</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Users must adhere to local state laws that govern ticket resale and entertainment tax.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Platform Rights</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                We reserve the right to suspend or terminate any account violating these terms or applicable Indian laws.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Dispute Resolution</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Disputes must first be reported to LayLow support. If unresolved, they will be referred to arbitration under the Arbitration and Conciliation Act, 1996 in Mumbai, Maharashtra.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Governing Law</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                These terms are governed by the laws of India, including the IT Act, 2000 and applicable state-level entertainment laws.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Section */}
        <section id="privacy-policy" className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
            <h2 className="text-section-title font-display text-[#222] mb-6">
              Privacy Policy
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-sm text-[#A9A9A9] mb-6">
                Last Updated: January 2025
              </p>
              <p className="text-body text-[#6B6B6B] mb-6">
                LayLow-India complies with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 under the IT Act, 2000.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Data Collected</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Name, contact info, payment details, government-issued ID (for KYC), device and IP information.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Usage</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Used for identity verification, fraud prevention, transactions, and customer support.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Consent</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                By using the platform, you consent to collection and use of your data in accordance with Indian privacy regulations.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Third-Party Sharing</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Shared only with secure partners (e.g., Razorpay, AWS) under strict data protection agreements.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Storage and Security</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Data is encrypted, stored on servers within India or with cross-border compliance.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">User Rights</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                You can request correction or deletion of your data by emailing <a href="mailto:support@laylow.in" className="text-[#D6A77A] hover:text-[#b98a5e]">support@laylow.in</a>.
              </p>
            </div>
          </div>
        </section>

        {/* Refund Policy Section */}
        <section id="refund-policy" className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
            <h2 className="text-section-title font-display text-[#222] mb-6">
              Refund Policy
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-sm text-[#A9A9A9] mb-6">
                Last Updated: January 2025
              </p>
              <p className="text-body text-[#6B6B6B] mb-6">
                LayLow-India follows a buyer-first refund policy, in compliance with the Consumer Protection Act, 2019.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Refund Eligibility</h3>
              <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
                <li>Ticket is proven to be fake, invalid, or already used.</li>
                <li>Seller fails to upload/deliver the ticket in time.</li>
                <li>Event is canceled or significantly altered.</li>
              </ul>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Refund Window</h3>
              <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
                <li>Users must report refund claims within 48 hours post-event.</li>
                <li>Refunds are processed in 5–7 working days via the original payment method.</li>
              </ul>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Non-Refundable Cases</h3>
              <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
                <li>Buyer regrets purchase but ticket was valid.</li>
                <li>Tickets delivered and event occurred without issue.</li>
              </ul>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Grievance Officer</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                For unresolved refund issues, contact our designated Grievance Officer at <a href="mailto:grievance@laylow.in" className="text-[#D6A77A] hover:text-[#b98a5e]">grievance@laylow.in</a> (as per IT Rules 2021).
              </p>
            </div>
          </div>
        </section>

        {/* Seller Agreement Section */}
        <section id="seller-agreement" className="mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
            <h2 className="text-section-title font-display text-[#222] mb-6">
              Seller Agreement
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-sm text-[#A9A9A9] mb-6">
                Last Updated: January 2025
              </p>
              <p className="text-body text-[#6B6B6B] mb-6">
                This Seller Agreement is governed under the Indian Contract Act and aligns with intermediary guidelines under Indian law.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Legality</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Sellers may only list tickets they legally own and are authorized to transfer as per Indian resale norms.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Price Disclosure</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Marked-up resale above face value may be restricted by some state laws. Sellers are advised to comply with local regulations.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Event Compliance</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Tickets that violate the event's T&C (e.g., non-transferable) are not allowed on the platform.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Escrow System</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Payments are held in escrow via our RBI-regulated payment gateway and released after event confirmation.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Payout & Taxation</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                All payouts may be subject to TDS as per Income Tax Act. PAN verification may be required.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">KYC Compliance</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                LayLow-India reserves the right to require Aadhar, PAN, or other KYC details for sellers.
              </p>
              
              <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Fraud Prevention</h3>
              <p className="text-body text-[#6B6B6B] mb-4">
                Accounts engaging in fraud will be terminated, blacklisted, and may be reported to law enforcement.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Download Section */}
        <section className="bg-[#F5E7D6] rounded-2xl p-8 text-center">
          <p className="text-body text-[#6B6B6B] mb-4">
            Need a copy for your records?
          </p>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center space-x-2 px-6 py-3 text-[#D6A77A] hover:text-[#b98a5e] transition-colors text-base font-medium"
          >
            <FaDownload className="text-sm" />
            <span>Download PDF</span>
          </button>
        </section>
      </main>

        {/* Legal Contact Info */}
        <section className="bg-white border-t border-[#E5E5E5] mt-16">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
            <div className="text-center">
              <p className="text-sm text-[#6B6B6B] mb-2">
                For legal inquiries or escalations, contact:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                <a 
                  href="mailto:legal@laylow.in" 
                  className="text-sm text-[#D6A77A] hover:text-[#b98a5e] transition-colors font-medium"
                >
                  legal@laylow.in
                </a>
                <span className="text-[#A9A9A9]">•</span>
                <a 
                  href="mailto:grievance@laylow.in" 
                  className="text-sm text-[#D6A77A] hover:text-[#b98a5e] transition-colors font-medium"
                >
                  grievance@laylow.in
                </a>
              </div>
              <p className="text-xs text-[#A9A9A9]">
                Last updated: January 2025 • LayLow-India
              </p>
            </div>
          </div>
        </section>
    </div>
  );
};

export default LegalPage; 