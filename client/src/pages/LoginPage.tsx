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
      } else {
        toast.error(error.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-3xl font-extrabold text-white text-center tracking-tight mb-2">Sign in to your account</h2>
          <p className="text-center text-sm text-neon-pink font-semibold">
            Or{' '}
            <Link
              to="/register"
              className="font-bold text-neon-pink hover:text-neon-blue hover:underline hover:underline-offset-4 transition-all"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
              <label htmlFor="password" className="block text-sm font-bold text-white mb-1">
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
                className={`mt-1 block w-full px-4 py-3 bg-[#231651] text-white border border-[#23223a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23223a] font-semibold placeholder-white/60`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-neon-pink font-bold">{errors.password.message}</p>
              )}
              <div className="mt-2 text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-neon-pink hover:text-neon-blue hover:underline transition-all"
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
              className="group relative w-full flex justify-center py-3 px-4 rounded-full text-lg font-bold text-white bg-neon-blue hover:bg-neon-pink hover:shadow-[0_0_16px_2px_#FF1EC6] focus:outline-none focus:ring-2 focus:ring-neon-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Sign in'
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

export default LoginPage; 