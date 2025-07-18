import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext.tsx';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner.tsx';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Redirect after successful login
  useEffect(() => {
    if (loginSuccess && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [loginSuccess, user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      setLoginSuccess(true);
    } catch (error: any) {
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error('Please verify your email address before logging in');
      } else if (error.response?.data?.code === 'USER_BANNED') {
        toast.error('Your account has been banned. Please contact support if you believe this is a mistake.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans py-8 px-4">
      <div className="max-w-md w-full space-y-8 bg-[#F5F5DC] rounded-2xl shadow-lg p-10 border border-gray-200">
        <div className="flex flex-col items-center">
          {/* Orange ticket icon SVG */}
          <svg className="w-12 h-12 text-[#FF6B35] mb-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="10" rx="3"/>
            <circle cx="8" cy="12" r="1.5" fill="white"/>
            <circle cx="16" cy="12" r="1.5" fill="white"/>
          </svg>
          <h2 className="text-4xl font-bold text-gray-900 text-center tracking-tight mb-3">Sign in to your account</h2>
          <p className="text-center text-lg text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-bold text-[#FF6B35] hover:text-[#E55A2B] hover:underline hover:underline-offset-4 transition-all"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
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
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
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
              <div className="mt-3 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#FF6B35] hover:text-[#E55A2B] hover:underline transition-all"
                >
                  Forgot password?
                </Link>
              </div>
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
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/"
              className="font-bold text-[#FF6B35] hover:text-[#E55A2B] hover:underline hover:underline-offset-4 transition-all text-lg"
            >
              Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 