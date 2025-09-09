import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time field validation
  const validateField = (fieldName, value) => {
    let error = '';
    
    switch (fieldName) {
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    return error === '';
  };

  const validateForm = () => {
    const emailValid = validateField('email', loginForm.email);
    const passwordValid = validateField('password', loginForm.password);
    
    return emailValid && passwordValid;
  };

  const handleLoginSubmit = async () => {
    // Enhanced validation
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authAPI.login(loginForm);

      const { token, user } = response.data;

      // Save token to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Show success message with user's name
      const userName = user.firstName || user.name || 'there';
      toast.success(`Welcome back, ${userName}! 🎉`);

      // Role-based navigation
      console.log('🔍 Login Debug - User data:', user);
      console.log('🔍 Login Debug - User role:', user.role);
      console.log('🔍 Login Debug - Role type:', typeof user.role);
      
      setTimeout(() => {
        if (user.role === 'organizer') {
          console.log('✅ Navigating to organizer dashboard');
          navigate('/organizer-dashboard');
        } else if (user.role === 'admin') {
          console.log('✅ Navigating to admin dashboard');
          navigate('/admin-dashboard');
        } else {
          console.log('✅ Navigating to home page');
          navigate('/home');
        }
      }, 1000);

    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      
      // Handle different error scenarios with user-friendly messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Account not found. Please check your email or sign up.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
        <button onClick={() => navigate('/')}>
          <div className="flex items-center justify-center mb-4">
            <ArrowLeft className="w-5 h-5 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-blue-600" style={{fontFamily: 'Poppins, sans-serif'}}>
              Tazkarti
            </h1>
            </div>
            </button>
          <h2 className="text-xl font-bold text-gray-900 mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>
            Welcome back!
          </h2>
          <p className="text-sm text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
            Login to your account.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLoginForm({...loginForm, email: value});
                    // Real-time validation with debounce
                    setTimeout(() => validateField('email', value), 300);
                  }}
                  onBlur={(e) => validateField('email', e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : loginForm.email && !fieldErrors.email 
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-600'
                  }`}
                  style={{fontFamily: 'Roboto, sans-serif'}}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600" style={{fontFamily: 'Inter, sans-serif'}}>
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2" style={{fontFamily: 'Inter, sans-serif'}}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLoginForm({...loginForm, password: value});
                    // Real-time validation with debounce
                    setTimeout(() => validateField('password', value), 300);
                  }}
                  onBlur={(e) => validateField('password', e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all text-sm disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    fieldErrors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : loginForm.password && !fieldErrors.password 
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-600'
                  }`}
                  style={{fontFamily: 'Roboto, sans-serif'}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600" style={{fontFamily: 'Inter, sans-serif'}}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 disabled:cursor-not-allowed"
                />
                <span className="ml-2 text-sm text-gray-700" style={{fontFamily: 'Inter, sans-serif'}}>
                  Remember me
                </span>
              </label>
              <button
                type="button"
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                style={{fontFamily: 'Inter, sans-serif'}}
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLoginSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              style={{backgroundColor: isLoading ? '#60A5FA' : '#0052CC', fontFamily: 'Inter, sans-serif'}}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Button */}
            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/google`}
              disabled={isLoading}
              className="w-full border border-gray-300 bg-white text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{fontFamily: 'Inter, sans-serif'}}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600" style={{fontFamily: 'Inter, sans-serif'}}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Register
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-4 text-xs text-center text-gray-500" style={{fontFamily: 'Inter, sans-serif'}}>
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;