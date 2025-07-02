import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  // Show success message after registration
  useEffect(() => {
    if (registerSuccess) {
      // Don't redirect - user needs to verify email first
      // The success message will be shown on the same page
    }
  }, [registerSuccess]);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await registerUser(data.email, data.name, data.password, data.phone);
      toast.success('Registration successful! Please check your email to verify your account.');
      setRegisterSuccess(true);
      // Don't automatically log in - user needs to verify email first
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] to-[#231651] font-sans">
        <div className="max-w-md w-full space-y-8 bg-black rounded-2xl shadow-2xl p-10">
          <div className="flex flex-col items-center text-center">
            {/* Success icon */}
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-white text-center tracking-tight mb-4">Check Your Email!</h2>
            <p className="text-gray-300 mb-6">
              We've sent a verification link to your email address. Please check your inbox and click the verification link to activate your account.
            </p>
            <div className="space-y-4 w-full">
              <Link
                to="/login"
                className="block w-full text-center bg-gradient-to-r from-neon-pink to-neon-blue text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Login
              </Link>
              <Link
                to="/"
                className="block w-full text-center bg-transparent border border-[#23223a] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#23223a] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18122B] to-[#231651] font-sans">
      <div className="max-w-md w-full space-y-8 bg-black rounded-2xl shadow-2xl p-10">
        <div className="flex flex-col items-center">
          {/* Neon pink ticket icon SVG */}
          <svg className="w-10 h-10 text-neon-pink mb-2" fill="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="10" rx="3"/>
            <circle cx="8" cy="12" r="1.5" fill="#18122B"/>
            <circle cx="16" cy="12" r="1.5" fill="#18122B"/>
          </svg>
          <h2 className="text-3xl font-extrabold text-white text-center tracking-tight mb-2">Create your account</h2>
          <p className="text-center text-sm text-neon-pink font-semibold">
            Or{' '}
            <Link
              to="/login"
              className="font-bold text-neon-pink hover:text-neon-blue hover:underline hover:underline-offset-4 transition-all"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-white mb-1">
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
                className={`mt-1 block w-full px-4 py-3 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-neon-pink font-bold">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-white mb-1">
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
                className={`mt-1 block w-full px-4 py-3 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-neon-pink font-bold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-white mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                {...register('phone')}
                className="mt-1 block w-full px-4 py-3 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-white mb-1">
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
                className={`mt-1 block w-full px-4 py-3 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-neon-pink font-bold">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-white mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                className={`mt-1 block w-full px-4 py-3 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-neon-pink font-bold">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 rounded-full text-lg font-bold text-white bg-neon-blue hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] focus:outline-none focus:ring-2 focus:ring-neon-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <Link
              to="/"
              className="font-bold text-neon-pink hover:text-neon-blue hover:underline hover:underline-offset-4 transition-all"
            >
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 