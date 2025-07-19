import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [showAccountExistsAlert, setShowAccountExistsAlert] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  // Debug logging
  useEffect(() => {
    console.log('RegisterPage rendered - all fields should be visible');
  }, []);

  // Show success message after registration
  useEffect(() => {
    if (registerSuccess) {
      // Don't redirect - user needs to verify email first
      // The success message will be shown on the same page
    }
  }, [registerSuccess]);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setShowAccountExistsAlert(false);
    
    try {
      await registerUser(data.email, data.name, data.password, data.phone);
      toast.success('Registration successful! Please check your email to verify your account.');
      setRegisterSuccess(true);
      // Don't automatically log in - user needs to verify email first
    } catch (error: any) {
      // Check if it's the specific "account already exists" error
      if (error.response?.data?.code === 'USER_ALREADY_EXISTS') {
        setShowAccountExistsAlert(true);
      } else {
        toast.error(error.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans py-8 px-4">
        <div className="max-w-md w-full space-y-8 bg-[#F5F5DC] rounded-2xl shadow-lg p-10 border border-gray-200">
          <div className="flex flex-col items-center text-center">
            {/* Success icon */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 text-center tracking-tight mb-4">Check Your Email!</h2>
            <p className="text-lg text-gray-600 mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the verification link to activate your account.
            </p>
            <div className="space-y-4 w-full">
              <Link
                to="/login"
                className="block w-full text-center bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-bold py-4 px-6 rounded-xl transition-all text-lg"
              >
                Go to Login
              </Link>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans py-8 px-4">
      <div className="max-w-md w-full bg-[#F5F5DC] rounded-2xl shadow-lg p-10 border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          {/* Orange ticket icon SVG */}
          <svg className="w-12 h-12 text-[#FF6B35] mb-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="10" rx="3"/>
            <circle cx="8" cy="12" r="1.5" fill="white"/>
            <circle cx="16" cy="12" r="1.5" fill="white"/>
          </svg>
          <h2 className="text-4xl font-bold text-gray-900 text-center tracking-tight mb-3">Create your account</h2>
          <p className="text-center text-lg text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-bold text-[#FF6B35] hover:text-[#E55A2B] hover:underline hover:underline-offset-4 transition-all"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Account Already Exists Alert */}
        {showAccountExistsAlert && (
          <div className="bg-orange-50 border border-orange-200 shadow-lg rounded-2xl p-6 mb-8 flex flex-col items-center max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 bg-orange-100 rounded-full p-2 mr-3">
                <svg className="h-7 w-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-orange-800">Account Already Exists</h3>
            </div>
            <p className="text-lg text-orange-700 mb-6 text-center">
              An account with this email already exists.<br />What would you like to do?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Link
                to="/login"
                className="flex-1 text-center bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-semibold py-3 rounded-xl shadow transition text-lg"
              >
                Sign In
              </Link>
              <Link
                to="/forgot-password"
                className="flex-1 text-center bg-white hover:bg-orange-50 text-orange-700 font-semibold py-3 rounded-xl shadow transition border-2 border-orange-300 text-lg"
              >
                Reset Password
              </Link>
              <button
                onClick={() => setShowAccountExistsAlert(false)}
                className="flex-1 text-center text-orange-600 hover:text-orange-800 font-semibold py-3 rounded-xl transition underline underline-offset-2 text-lg"
                style={{ minWidth: 120 }}
              >
                Try Different Email
              </button>
            </div>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
                className={`mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold placeholder-gray-500 text-lg`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold placeholder-gray-500 text-lg`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                {...register('phone')}
                className="mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold placeholder-gray-500 text-lg"
                placeholder="Enter your phone number"
              />
            </div>
            
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold placeholder-gray-500 text-lg`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match',
                })}
                className={`mt-1 block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent font-semibold placeholder-gray-500 text-lg`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 font-semibold">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-6 rounded-xl text-lg font-bold text-white bg-[#FF6B35] hover:bg-[#E55A2B] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>


        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 