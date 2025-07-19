import React from 'react';
import { Link } from 'react-router-dom';

const RefundPolicyPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-[#FAF8F6] font-sans">


      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-section-title font-display text-[#222] mb-6">
            Refund Policy
          </h1>
          <p className="text-body-large text-[#6B6B6B] max-w-3xl mx-auto prose">
            Our buyer-first refund policy ensures your satisfaction and protection in compliance with Indian consumer laws.
          </p>

        </div>

        {/* Refund Policy Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] p-8">
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
              <li>Event is cancelled or significantly altered.</li>
              <li>Delivery failure within 24 hours of event.</li>
              <li>Technical error on our platform.</li>
              <li>Seller fails to provide valid ticket.</li>
            </ul>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Refund Process</h3>
            <p className="text-body text-[#6B6B6B] mb-4">
              Refunds are processed within 5-7 working days to your original payment method. You will receive email confirmation once processed.
            </p>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Non-Refundable Cases</h3>
            <ul className="list-disc list-inside text-body text-[#6B6B6B] mb-4 space-y-2">
              <li>Buyer's remorse (if ticket is valid and event occurs as scheduled).</li>
              <li>Failure to attend due to personal reasons.</li>
              <li>Weather-related issues (unless event is officially cancelled).</li>
              <li>Transportation or accommodation issues.</li>
            </ul>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">How to Request a Refund</h3>
            <p className="text-body text-[#6B6B6B] mb-4">
              Contact our support team at <a href="mailto:support@laylow.in" className="text-[#D6A77A] hover:text-[#b98a5e]">support@laylow.in</a> with your order details and reason for refund request.
            </p>
            
            <h3 className="text-card-title font-display text-[#222] mt-8 mb-4">Dispute Resolution</h3>
            <p className="text-body text-[#6B6B6B] mb-4">
              If you disagree with a refund decision, you can escalate to our grievance officer at <a href="mailto:grievance@laylow.in" className="text-[#D6A77A] hover:text-[#b98a5e]">grievance@laylow.in</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicyPage; 