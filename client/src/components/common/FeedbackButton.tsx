import React, { useState } from 'react';
import { FaCommentAlt } from 'react-icons/fa';
import FeedbackForm from './FeedbackForm.tsx';

interface FeedbackButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'button' | 'floating' | 'text';
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  className = "", 
  children = "Feedback",
  variant = "button"
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleClick = () => {
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
  };

  const renderButton = () => {
    switch (variant) {
      case 'floating':
        return (
          <button
            onClick={handleClick}
            className={`fixed bottom-6 right-6 w-14 h-14 bg-[#D6A77A] text-white rounded-full shadow-lg hover:bg-[#b98a5e] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:ring-offset-2 z-40 ${className}`}
            title="Share Feedback"
          >
            <FaCommentAlt className="text-xl mx-auto" />
          </button>
        );
      
      case 'text':
        return (
          <button
            onClick={handleClick}
            className={`text-[#D6A77A] hover:text-[#b98a5e] transition-colors font-medium ${className}`}
          >
            {children}
          </button>
        );
      
      default:
        return (
          <button
            onClick={handleClick}
            className={`px-6 py-3 bg-[#D6A77A] text-white font-bold rounded-lg hover:bg-[#b98a5e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#D6A77A] focus:ring-offset-2 ${className}`}
          >
            {children}
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      <FeedbackForm isOpen={isFormOpen} onClose={handleClose} />
    </>
  );
};

export default FeedbackButton; 