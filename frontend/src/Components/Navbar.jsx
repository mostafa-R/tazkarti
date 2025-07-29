import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const location = useLocation();
  const navigate = useNavigate(); 

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  
  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login'); 
  };

  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2"> 
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎫</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Tazkarti</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/home"
              className={`${
                isActive('/home') 
                  ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-700 hover:text-blue-600'
              } transition-all duration-200`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`${
                isActive('/events') 
                  ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-700 hover:text-blue-600'
              } transition-all duration-200`}
            >
              Events
            </Link>
           
            {isLoggedIn && (
              <Link
                to="/my-tickets"
                className={`${
                  isActive('/my-tickets') 
                    ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                } transition-all duration-200`}
              >
                My Tickets
              </Link>
            )}
          </div>

        
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>🔗</span>
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
               
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-sm">👤</span>
                  </div>
                  <span className="text-gray-700 font-medium">Zyad</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors duration-200 flex items-center space-x-1"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-4 px-4">
              <Link
                to="/home"
                onClick={closeMobileMenu}
                className={`${
                  isActive('/home') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700'
                } block px-3 py-2 rounded-md hover:bg-gray-50 transition-all duration-200`}
              >
                🏠 Home
              </Link>
              <Link
                to="/events"
                onClick={closeMobileMenu}
                className={`${
                  isActive('/events') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700'
                } block px-3 py-2 rounded-md hover:bg-gray-50 transition-all duration-200`}
              >
                🎭 Events
              </Link>
              
              {isLoggedIn && (
                <Link
                  to="/my-tickets"
                  onClick={closeMobileMenu}
                  className={`${
                    isActive('/my-tickets') 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-700'
                  } block px-3 py-2 rounded-md hover:bg-gray-50 transition-all duration-200`}
                >
                  🎫 My Tickets
                </Link>
              )}
            </div>

           
            <div className="border-t border-gray-200 pt-4 px-4">
              {!isLoggedIn ? (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>🔗</span>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-center hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  {/* Mobile User Info */}
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">👤</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Zyad</p>
                      <p className="text-sm text-gray-500">Zyad@example.com</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="text-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition-all duration-200 text-left flex items-center space-x-2"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;