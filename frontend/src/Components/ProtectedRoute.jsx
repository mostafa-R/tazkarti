import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation();
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  console.log('🔍 ProtectedRoute - Token:', token);
  console.log('🔍 ProtectedRoute - User:', user);
  console.log('🔍 ProtectedRoute - Required Role:', requiredRole);

  // Check if user is authenticated
  if (!token || !user) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requiredRole && user.role !== requiredRole) {
    console.log(`❌ Role mismatch. Required: ${requiredRole}, User has: ${user.role}`);
    // Redirect based on user role
    if (user.role === 'organizer') {
      console.log('🔄 Redirecting to organizer dashboard');
      return <Navigate to="/organizer-dashboard" replace />;
    } else if (user.role === 'admin') {
      console.log('🔄 Redirecting to admin dashboard');
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      console.log('🔄 Redirecting to home');
      return <Navigate to="/home" replace />;
    }
  }

  console.log('✅ Access granted');
  return children;
};

export default ProtectedRoute;
