import React from 'react';
import { Link } from 'react-router-dom';

const SellerAgreementPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-[#FAF8F6] font-sans">


            {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Back to Legal Policies */}
        <div className="mb-8">
          <Link 
            to="/legal" 
            className="inline-flex items-center text-[#D6A77A] hover:text-[#b98a5e] transition-colors font-medium"
          >
            ← Back to Legal Policies
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-section-title font-display text-[#222] mb-6">
            Seller Agreement
          </h1>
          <p className="text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose">
            Guidelines and obligations for sellers on LayLow-India platform to ensure fair and secure transactions.
          </p>
 
          </div>

        {/* Seller Agreement Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-[#A9A9A9] mb-6">
              Last Updated: January 2025
            </p>
            <p className="text-body text-[#6B6B6B] mb-6">
              This agreement outlines the terms and conditions for sellers using the LayLow-India platform to list and sell tickets.
            </p>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Seller Eligibility</h3>
            <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
              <li>Must be 18+ years old and legally capable of entering contracts.</li>
              <li>Must complete KYC verification with valid government ID.</li>
              <li>Must have a verified bank account for payment processing.</li>
              <li>Must not have been previously banned from the platform.</li>
            </ul>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Ticket Listing Requirements</h3>
            <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
              <li>Only genuine, valid tickets may be listed.</li>
              <li>Accurate event details, date, time, and venue information required.</li>
              <li>Clear, high-quality images of tickets must be provided.</li>
              <li>Pricing must comply with local regulations and platform guidelines.</li>
              <li>Seat numbers and sections must be accurately specified.</li>
            </ul>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Prohibited Activities</h3>
            <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
              <li>Listing fake, duplicate, or invalid tickets.</li>
              <li>Price gouging beyond reasonable market rates.</li>
              <li>Circumventing platform fees or payment systems.</li>
              <li>Providing false information about tickets or events.</li>
              <li>Coordinating with other sellers to manipulate prices.</li>
            </ul>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Payment and Commission</h3>
            <p className="text-body text-[#6B6B6B] mb-4">
              Sellers receive payment after successful event completion, minus platform commission of 10% and applicable taxes. Payment is processed within 3-5 working days post-event.
            </p>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Seller Responsibilities</h3>
            <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
              <li>Ensure ticket validity and authenticity.</li>
              <li>Provide timely customer support for ticket-related queries.</li>
              <li>Maintain accurate inventory and update listings promptly.</li>
              <li>Comply with all applicable laws and regulations.</li>
              <li>Cooperate with platform investigations and dispute resolution.</li>
            </ul>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Dispute Resolution</h3>
            <p className="text-body text-[#6B6B6B] mb-4">
              Sellers must participate in our dispute resolution process. Failure to resolve disputes may result in account suspension and withholding of payments.
            </p>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Termination</h3>
            <p className="text-body text-[#6B6B6B] mb-4">
              LayLow-India reserves the right to terminate seller accounts for violations of this agreement, with immediate effect and forfeiture of pending payments.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerAgreementPage; 