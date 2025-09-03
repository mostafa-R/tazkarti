import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Ticket, Users, LogOut, Menu, X, ChevronLeft } from "lucide-react";

const OrganizerNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      const userJson = localStorage.getItem("user");

      if (token && userJson) {
        try {
          const userData = JSON.parse(userJson);
          setIsLoggedIn(true);
          setUserName(userData.firstName || "Organizer");
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
    window.addEventListener("storage", checkAuthStatus);
    window.addEventListener("authStateChanged", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener("authStateChanged", checkAuthStatus);
    };
  }, []);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    window.dispatchEvent(new Event("authStateChanged"));
    navigate("/home");
    closeMobileMenu();
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/organizer-dashboard") return "Dashboard";
    if (path === "/create-event") return "Create Event";
    if (path === "/manage-tickets") return "Manage Tickets";
    if (path === "/booking-management") return "Booking Management";
    return "Organizer Panel";
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo & Back to Dashboard */}
          <div className="flex items-center space-x-4">
            <Link to="/organizer-dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎫</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Tazkarti</span>
            </Link>
            
            {/* Back to Dashboard Button */}
            {location.pathname !== "/organizer-dashboard" && (
              <div className="flex items-center">
                <span className="text-gray-300 mx-2">/</span>
                <Link
                  to="/organizer-dashboard"
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>
              </div>
            )}
          </div>

          {/* Center - Page Title */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h1>
          </div>

    

          {/* Right Side - User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
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
                  <span className="text-sm text-gray-700 font-medium">
                    {userName}
                  </span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 space-y-2">
            {/* Page Title - Mobile */}
            <div className="px-4 pb-3 border-b border-gray-200">
              <h1 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h1>
            </div>

            {/* Navigation Links - Mobile */}
            <div className="px-4 space-y-2">
              <Link
                to="/organizer-dashboard"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive("/organizer-dashboard")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/create-event"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive("/create-event")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Create Event</span>
              </Link>

              <Link
                to="/manage-tickets"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive("/manage-tickets")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span>Manage Tickets</span>
              </Link>

              <Link
                to="/booking-management"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive("/booking-management")
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Booking Management</span>
              </Link>
            </div>

            {/* User Info & Logout - Mobile */}
            {isLoggedIn && (
              <div className="px-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
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
                      <p className="text-sm font-medium text-gray-700">{userName}</p>
                      <p className="text-xs text-gray-500">Organizer</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default OrganizerNavbar;
