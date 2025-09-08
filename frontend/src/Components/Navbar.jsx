import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language;

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check if user is logged in (you can use localStorage, sessionStorage, or context)
      const token = localStorage.getItem("authToken");
      const userJson = localStorage.getItem("user");

      if (token && userJson) {
        try {
          const userData = JSON.parse(userJson);
          setIsLoggedIn(true);
          setUserName(userData.firstName || "User");
          setUser(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsLoggedIn(false);
          setUserName("");
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setUser(null);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener("storage", checkAuthStatus);

    // Custom event listener for login/logout
    window.addEventListener("authStateChanged", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("authStateChanged", checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Cookies.remove("jwt");
    setIsLoggedIn(false);
    setUserName("");

    // Dispatch custom event for other components
    window.dispatchEvent(new Event("authStateChanged"));

    // Navigate to home or login page
    navigate("/home");
    closeMobileMenu();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
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
    const handleClickOutside = (event) => {
      // Check if click is outside language menu
      if (isLanguageMenuOpen) {
        const languageMenu = document.querySelector("[data-language-menu]");
        if (languageMenu && !languageMenu.contains(event.target)) {
          setIsLanguageMenuOpen(false);
        }
      }

      // Check if click is outside user menu
      if (isUserMenuOpen) {
        const userMenu = document.querySelector("[data-user-menu]");
        if (userMenu && !userMenu.contains(event.target)) {
          setIsUserMenuOpen(false);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isLanguageMenuOpen, isUserMenuOpen]);

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎫</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Tazkarti</span>
            </Link>
          </div>

          {/* Navigation Links - Desktop (Center) */}
          <div
            className={`hidden md:flex items-center ${
              currentLanguage === "ar"
                ? "flex-row-reverse space-x-reverse space-x-8"
                : "space-x-8"
            }`}
          >
            <Link
              to="/home"
              className={`${
                isActive("/home")
                  ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              } transition-all duration-200 whitespace-nowrap`}
            >
              {t("home")}
            </Link>
            <Link
              to="/events"
              className={`${
                isActive("/events")
                  ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                  : "text-gray-700 hover:text-blue-600"
              } transition-all duration-200 whitespace-nowrap`}
            >
              {t("activities")}
            </Link>

            {isLoggedIn && (
              <>
                <Link
                  to="/my-tickets"
                  className={`${
                    isActive("/my-tickets")
                      ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                      : "text-gray-700 hover:text-blue-600"
                  } transition-all duration-200 whitespace-nowrap`}
                >
                  {t("mybooking")}
                </Link>
              </>
            )}

            {/* Organizer Dashboard Link - Desktop */}
            {isLoggedIn && user?.role === "organizer" && (
              <Link
                to="/organizer-dashboard"
                className={`${
                  isActive("/organizer-dashboard")
                    ? "text-blue-600 font-medium border-b-2 border-blue-600 pb-1"
                    : "text-gray-700 hover:text-blue-600"
                } transition-all duration-200 whitespace-nowrap`}
              >
                {t("organizerDashboard")}
              </Link>
            )}
          </div>

          {/* Right Side - Language & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLanguageMenu(e);
                }}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors duration-200 ${
                  isLanguageMenuOpen ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
                aria-haspopup="true"
                aria-expanded={isLanguageMenuOpen}
              >
                <span className="text-sm font-medium text-gray-700">
                  {currentLanguage === "en" ? "🌐 EN" : "🌐 AR"}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    isLanguageMenuOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isLanguageMenuOpen && (
                <div
                  data-language-menu
                  className="absolute top-full mt-2 right-0 w-40 bg-white rounded-lg shadow-2xl py-2 z-[9999] border border-gray-200 min-w-max transform transition-all duration-200 ease-out opacity-100 scale-100"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeLanguage("en");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                      currentLanguage === "en"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>English</span>
                    {currentLanguage === "en" && <span>✓</span>}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      changeLanguage("ar");
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
                      currentLanguage === "ar"
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>العربية</span>
                    {currentLanguage === "ar" && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium max-w-[100px] truncate">
                      {userName}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isUserMenuOpen ? "transform rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div
                      data-user-menu
                      className="absolute top-full mt-2 right-0 w-48 bg-white rounded-lg shadow-2xl py-2 z-[9999] border border-gray-200 min-w-max transform transition-all duration-200 ease-out opacity-100 scale-100"
                    >
                      <Link
                        to="/profile"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeMobileMenu();
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        My Profile
                      </Link>

                      <hr className="my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogout();
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap text-sm font-medium px-3 py-1.5"
                >
                  {t("signin") || "Sign In"}
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap text-sm font-medium"
                >
                  {t("register") || "Register"}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 space-y-4">
            {/* User Info (if logged in) */}
            {isLoggedIn && (
              <div className="px-4 pb-3 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("welcomeBack") || "Welcome back!"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div
              className={`flex flex-col space-y-2 px-4 ${
                currentLanguage === "ar" ? "items-end" : "items-start"
              }`}
            >
              <Link
                to="/home"
                onClick={closeMobileMenu}
                className={`${
                  isActive("/home")
                    ? "text-blue-600 font-medium bg-blue-50"
                    : "text-gray-700"
                } flex items-center ${
                  currentLanguage === "ar" ? "space-x-reverse" : "space-x-2"
                } px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200`}
              >
                <span>🏠</span>
                <span>{t("home")}</span>
              </Link>

              <Link
                to="/events"
                onClick={closeMobileMenu}
                className={`${
                  isActive("/events")
                    ? "text-blue-600 font-medium bg-blue-50"
                    : "text-gray-700"
                } flex items-center ${
                  currentLanguage === "ar" ? "space-x-reverse" : "space-x-2"
                } px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200`}
              >
                <span>🎭</span>
                <span>{t("activities")}</span>
              </Link>

              {isLoggedIn && (
                <>
                  <Link
                    to="/my-tickets"
                    onClick={closeMobileMenu}
                    className={`${
                      isActive("/my-tickets")
                        ? "text-blue-600 font-medium bg-blue-50"
                        : "text-gray-700"
                    } flex items-center ${
                      currentLanguage === "ar" ? "space-x-reverse" : "space-x-2"
                    } px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200`}
                  >
                    <span>🎫</span>
                    <span>{t("mybooking")}</span>
                  </Link>
                </>
              )}

              {/* Organizer Dashboard Link - Mobile */}
              {isLoggedIn && user?.role === "organizer" && (
                <Link
                  to="/organizer-dashboard"
                  onClick={closeMobileMenu}
                  className={`${
                    isActive("/organizer-dashboard")
                      ? "text-blue-600 font-medium bg-blue-50"
                      : "text-gray-700"
                  } flex items-center ${
                    currentLanguage === "ar" ? "space-x-reverse space-x-0" : "space-x-2"
                  } px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200`}
                >
                  <span className={currentLanguage === "ar" ? "ml-2" : "mr-0"}>📊</span>
                  <span>{t("organizerDashboard")}</span>
                </Link>
              )}
            </div>

            {/* Mobile Language Selector */}
            <div className="px-4">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t("language") || "Language"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center ${
                      currentLanguage === "en"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors duration-200`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage("ar")}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center ${
                      currentLanguage === "ar"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                    className="flex items-center justify-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium border border-gray-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>{t("signin") || "Sign In"}</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    {t("register") || "Register"}
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center space-x-2 w-full text-gray-700 hover:text-red-600 px-3 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
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
