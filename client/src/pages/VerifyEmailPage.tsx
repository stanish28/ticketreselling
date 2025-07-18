import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api.ts';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('No verification token found');
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        if (response.success) {
          setVerified(true);
          toast.success('Email verified successfully!');
        } else {
          setError(response.error || 'Verification failed');
          toast.error(response.error || 'Verification failed');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Verification failed';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] to-[#231651] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-white mt-4 text-lg font-semibold">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] to-[#231651] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-[#231651] rounded-2xl p-8 shadow-2xl border border-[#23223a]">
          {verified ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Email Verified!</h1>
              <p className="text-gray-300 mb-6">
                Your email has been successfully verified. You can now log in to your account and access all features.
              </p>
              <Link
                to="/login"
                className="inline-block bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
              <p className="text-gray-300 mb-6">
                {error || 'Something went wrong with the verification process.'}
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Go to Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-transparent border border-[#23223a] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#23223a] transition-colors"
                >
                  Register Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 