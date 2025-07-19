import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {

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
            Privacy Policy
          </h1>
          <p className="text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose">
            Learn how we collect, use, and protect your personal information in compliance with Indian privacy laws.
          </p>
 
          </div>

        {/* Privacy Policy Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
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
      </main>
    </div>
  );
};

export default PrivacyPolicyPage; 