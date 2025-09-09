import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get token, user data and error from URL parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userData = params.get('userData');
        const error = params.get('error');
        const role = params.get('role');

        if (error) {
          toast.error('Authentication failed. Please try again.');
          navigate('/login');
          return;
        }

        if (!token) {
          toast.error('Invalid authentication response. Please try again.');
          navigate('/login');
          return;
        }

        // Store token in localStorage
        localStorage.setItem('authToken', token);

        // Parse user data if available
        if (userData) {
          try {
            const parsedUserData = JSON.parse(decodeURIComponent(userData));
            localStorage.setItem('user', JSON.stringify(parsedUserData));
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        // Show success message
        toast.success(`Welcome! You've successfully logged in 🎉`);

        // Role-based navigation
        setTimeout(() => {
          if (role === 'organizer') {
            navigate('/organizer-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/home');
          }
        }, 1000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Something went wrong. Please try again.');
        navigate('/login');
      } finally {
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      {isProcessing && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Completing Authentication</h2>
          <p className="text-gray-600">Please wait while we log you in...</p>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;
