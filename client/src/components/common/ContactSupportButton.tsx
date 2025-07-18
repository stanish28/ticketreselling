import React from 'react';

interface ContactSupportButtonProps {
  className?: string;
  children?: React.ReactNode;
}

const ContactSupportButton: React.FC<ContactSupportButtonProps> = ({ 
  className = "", 
  children = "Contact Support" 
}) => {
  const handleContactSupport = () => {
    const subject = "Support Request - LayLow-India";
    const body = `Hello LayLow-India Support Team,

I hope this email finds you well. I am reaching out regarding a support request.

Order ID: [Please provide your Order ID if applicable]

Issue Description:
[Please describe your issue or question here]

Additional Details:
[Any additional information that might help us assist you better]

Thank you for your time and assistance.

Best regards,
[Your Name]`;

    // Try multiple approaches to open email client
    try {
      // Method 1: Try mailto link
      const mailtoLink = `mailto:support@laylow.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      
      // Method 2: Fallback - copy to clipboard and show instructions
      setTimeout(() => {
        const emailContent = `To: support@laylow.in\nSubject: ${subject}\n\n${body}`;
        navigator.clipboard.writeText(emailContent).then(() => {
          alert('Email details copied to clipboard! Please paste them into your email client.');
        }).catch(() => {
          alert(`Please open your email client and send to: support@laylow.in\n\nSubject: ${subject}\n\nBody:\n${body}`);
        });
      }, 1000);
    } catch (error) {
      // Method 3: Show manual instructions
      alert(`Please open your email client and send to: support@laylow.in\n\nSubject: ${subject}\n\nBody:\n${body}`);
    }
  };

  return (
    <button
      onClick={handleContactSupport}
      className={`px-6 py-3 bg-[#D6A77A] text-white font-bold rounded-lg hover:bg-[#b98a5e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
};

export default ContactSupportButton; 