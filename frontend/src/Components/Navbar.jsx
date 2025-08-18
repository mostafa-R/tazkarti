import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); 
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/login'); 
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleLanguageMenu = (e) => {
    e.stopPropagation();
    setIsLanguageMenuOpen(!isLanguageMenuOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLanguageMenuOpen(false);
    closeMobileMenu();
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (isLanguageMenuOpen) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isLanguageMenuOpen]);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left Side - Language & Logout */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={toggleLanguageMenu}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors duration-200 ${
                  isLanguageMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
                }`}
                aria-haspopup="true"
                aria-expanded={isLanguageMenuOpen}
              >
                <span className="text-sm font-medium text-gray-700">
                  {currentLanguage === 'en' ? 'English' : 'العربية'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isLanguageMenuOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute top-full mt-1 left-0 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button 
                    onClick={() => changeLanguage("en")} 
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                      currentLanguage === 'en' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>English</span>
                    {currentLanguage === 'en' && <span>✓</span>}
                  </button>
                  <button 
                    onClick={() => changeLanguage("ar")} 
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                      currentLanguage === 'ar' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>العربية</span>
                    {currentLanguage === 'ar' && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Logout Button (visible when logged in) */}
            {isLoggedIn && (
              <button 
                onClick={handleLogout} 
                className="text-gray-700 hover:text-red-600 transition-colors duration-200 whitespace-nowrap text-sm font-medium flex items-center"
              >
                <span className="mr-1">🚪</span>
                {t("logout")}
              </button>
            )}
          </div>

          {/* Navigation Links - Desktop (Center) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/home" className={`${isActive('/home') ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'} transition-all duration-200 whitespace-nowrap`}>
              {t("home")}
            </Link>
            <Link to="/events" className={`${isActive('/activities') ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'} transition-all duration-200 whitespace-nowrap`}>
              {t("activities")}
            </Link>
            {isLoggedIn && (
              <Link to="/my-tickets" className={`${isActive('/my-tickets') ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' : 'text-gray-700 hover:text-blue-600'} transition-all duration-200 whitespace-nowrap`}>
                {t("mybooking")}
              </Link>
            )}
          </div>

          {/* Right Side - Logo */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2"> 
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎫</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Tazkarti</span>
            </Link>
          </div>

          {/* Right Side - Auth (for non-logged in users) */}
          <div className="hidden md:flex items-center space-x-6">
            {!isLoggedIn && (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap text-sm font-medium">
                  {t("login")}
                </Link>
                <Link to="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap text-sm font-medium">
                  {t("register")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-2 px-4">
              <Link 
                to="/home" 
                onClick={closeMobileMenu} 
                className={`${isActive('/home') ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'} flex items-center space-x-2 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200`}
              >
                <span>🏠</span>
                <span>{t("home")}</span>
              </Link>
              
              <Link 
                to="/events" 
                onClick={closeMobileMenu} 
                className={`${isActive('/events') ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'} flex items-center space-x-2 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200`}
              >
                <span>🎭</span>
                <span>{t("events")}</span>
              </Link>
              
              {isLoggedIn && (
                <Link 
                  to="/my-tickets" 
                  onClick={closeMobileMenu} 
                  className={`${isActive('/my-tickets') ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-700'} flex items-center space-x-2 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200`}
                >
                  <span>🎫</span>
                  <span>{t("myTickets")}</span>
                </Link>
              )}
            </div>

            {/* Mobile Language Selector */}
            <div className="px-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t("language")}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => changeLanguage("en")} 
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center ${
                      currentLanguage === 'en' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors duration-200`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => changeLanguage("ar")} 
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center ${
                      currentLanguage === 'ar' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors duration-200`}
                  >
                    العربية
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Auth Section */}
            <div className="px-4 pt-2 border-t border-gray-200">
              {!isLoggedIn ? (
                <div className="space-y-3">
                  <Link 
                    to="/login" 
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                  >
                    {t("login")}
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={closeMobileMenu}
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    {t("register")}
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center space-x-2 w-full text-gray-700 hover:text-red-600 px-3 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                >
                  <span>🚪</span>
                  <span>{t("logout")}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;