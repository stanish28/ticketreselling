import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {

  return (
    <div className="min-h-screen bg-[#FAF8F6] font-sans">


      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-section-title font-display text-[#222] mb-6">
            Terms of Service
          </h1>
          <p className="text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose">
            Please read these terms carefully to understand your rights and obligations when using LayLow-India.
          </p>

        </div>

        {/* Terms of Service Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
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
      </main>
    </div>
  );
};

export default TermsOfServicePage; 