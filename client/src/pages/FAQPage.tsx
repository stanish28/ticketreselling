import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronDown, FaChevronRight, FaEnvelope, FaComments } from 'react-icons/fa';
import ContactSupportButton from '../components/common/ContactSupportButton.tsx';
import FeedbackButton from '../components/common/FeedbackButton.tsx';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqData: FAQItem[] = [
    {
      id: 'faq1',
      question: 'How do I know the tickets are genuine?',
      answer: 'All tickets on LayLow-India are verified through our multi-step authentication process. We use QR code verification, seller KYC, and escrow payments to ensure authenticity. If any ticket is found to be fake, you get a full refund. Our verification system includes real-time checks against event databases and seller background verification.'
    },
    {
      id: 'faq2',
      question: 'What if the event gets cancelled?',
      answer: 'If an event is cancelled or significantly altered, you\'re eligible for a full refund. We process refunds within 5-7 working days to your original payment method. Our team monitors all events and automatically notifies affected users. For events postponed to a new date, you can choose to attend the rescheduled event or request a refund.'
    },
    {
      id: 'faq3',
      question: 'How quickly can I get my tickets?',
      answer: 'Most tickets are delivered instantly via QR code to your email and phone. For physical tickets, we offer express delivery options. You can also access your tickets anytime through your LayLow-India account. Digital tickets are typically available within minutes of purchase, while physical tickets are shipped within 24-48 hours.'
    },
    {
      id: 'faq4',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including UPI, credit/debit cards, net banking, and digital wallets like Paytm, PhonePe, and Google Pay. All payments are processed through RBI-regulated payment gateways with bank-level security. We also support EMI options for tickets above ₹5,000.'
    },
    {
      id: 'faq5',
      question: 'Can I sell my tickets on LayLow-India?',
      answer: 'Yes! You can easily list your tickets for sale. Simply create an account, verify your identity through our KYC process, and upload your ticket details. Our platform handles the payment processing and ticket transfer. Sellers receive payment after the event is successfully completed, ensuring buyer satisfaction.'
    },
    {
      id: 'faq6',
      question: 'What is your refund policy?',
      answer: 'We offer a buyer-first refund policy in compliance with the Consumer Protection Act, 2019. Refunds are available for fake tickets, delivery failures, event cancellations, or significant event changes. You must report issues within 48 hours post-event. Refunds are processed in 5-7 working days to your original payment method.'
    },
    {
      id: 'faq7',
      question: 'How do you verify sellers?',
      answer: 'All sellers undergo a comprehensive verification process including KYC (Know Your Customer) verification, PAN card validation, and bank account verification. We also monitor seller behavior and transaction history. Sellers with verified accounts receive special badges and higher trust scores, making them more visible to buyers.'
    },
    {
      id: 'faq8',
      question: 'Is my personal information secure?',
      answer: 'Absolutely. We comply with the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Your data is encrypted using 256-bit SSL encryption, stored on secure servers within India, and never shared with unauthorized third parties. We use the same security protocols as major banks.'
    },
    {
      id: 'faq9',
      question: 'What happens if I can\'t attend the event?',
      answer: 'If you can\'t attend an event, you can resell your ticket on our platform. Simply list it for sale and we\'ll handle the transfer process. However, please note that refunds are not available for buyer\'s remorse if the ticket was valid and the event occurred as scheduled. We recommend checking event details carefully before purchasing.'
    },
    {
      id: 'faq10',
      question: 'How do I contact customer support?',
      answer: 'Our customer support team is available 24/7. You can reach us via email at support@laylow.in, through our live chat feature on the website, or by calling our toll-free number. For legal inquiries, contact legal@laylow.in, and for grievance officer escalations, use grievance@laylow.in. We typically respond within 2-4 hours.'
    }
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6] font-sans">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-[#E5E5E5]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <Link 
              to="/" 
              className="flex items-center space-x-3 text-[#6B6B6B] hover:text-[#222] transition-colors"
            >
              <FaChevronLeft className="text-base" />
              <span className="text-base font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-3">
              <span className="w-7 h-7 rounded-lg bg-[#D6A77A] flex items-center justify-center font-bold text-white text-base">L</span>
              <span className="font-display font-bold text-xl text-[#222]">LayLow-India</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-section-title font-display text-[#222] mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-body-large text-[#6B6B6B] max-w-2xl mx-auto">
            Find answers to the most common questions about buying and selling tickets on LayLow-India.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((faq) => {
            const isOpen = openItems.has(faq.id);
            
            return (
              <div 
                key={faq.id}
                id={faq.id}
                className="bg-white rounded-2xl shadow-lg border border-[#E5E5E5] overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  onKeyDown={(e) => handleKeyDown(e, faq.id)}
                  className="w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:ring-inset rounded-2xl"
                  aria-expanded={isOpen}
                  aria-controls={`${faq.id}-content`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-card-title font-display text-[#222] pr-4">
                      {faq.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <FaChevronDown className="text-[#D6A77A] text-lg transition-transform duration-200" />
                      ) : (
                        <FaChevronRight className="text-[#D6A77A] text-lg transition-transform duration-200" />
                      )}
                    </div>
                  </div>
                </button>
                
                <div
                  id={`${faq.id}-content`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-hidden={!isOpen}
                >
                  <div className="px-6 pb-5">
                    <p className="text-body text-[#6B6B6B] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-body text-[#6B6B6B] mb-6">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ContactSupportButton className="px-6 py-3 bg-gradient-to-r from-[#D6A77A] to-[#b98a5e] hover:from-[#b98a5e] hover:to-[#a67a4e] shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]">
              <FaEnvelope className="inline mr-2" />
              Contact Support
            </ContactSupportButton>
            <FeedbackButton 
              variant="text" 
              className="inline-flex items-center space-x-2 px-6 py-3 text-[#D6A77A] hover:text-[#b98a5e] transition-colors font-medium"
            >
              <FaComments className="inline mr-2" />
              <span>Share Feedback</span>
            </FeedbackButton>
            <Link 
              to="/legal"
              className="inline-flex items-center space-x-2 px-6 py-3 text-[#D6A77A] hover:text-[#b98a5e] transition-colors font-medium group"
            >
              <span>View Legal Policies</span>
              <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQPage; 