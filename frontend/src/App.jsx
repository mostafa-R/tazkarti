import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import HomePage from './pages/Home.jsx';
import EventsPage from './pages/Event.jsx';
import EventDetailsPage from './pages/EventDetails.jsx';
import BookingPage from './pages/Booking.jsx';
import LoginPage from './pages/Login.jsx';
import BookingConfirmationPage from './pages/BookingConfirmation.jsx';
import PaymentPage from './pages/Payment.jsx';
import MyTicketsPage from './pages/Ticket.jsx';
import TicketDetailsPage from './pages/TicketDetailsPage.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import CreateEventPage from './pages/CreateEvent.jsx';
import EmailVerification from './Components/EmailVerification.jsx';
import ChatBot from './Components/ChatWidget.jsx';
import SignupPage from './pages/SignupPage.jsx';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;


  const hideNavbarRoutes = ['/', '/login', '/signup', '/booking-confirm', '/payment', '/verify-email'];
  const hideNavbarPatterns = ['/event/', '/ticket/', '/my-tickets/', '/booking/', '/organizer-dashboard', '/admin-dashboard', '/create-event']; // ✅ إضافة /booking/ للـ patterns
  


  const shouldHideNavbar =
    hideNavbarRoutes.includes(pathname) ||
    hideNavbarPatterns.some(pattern => pathname.startsWith(pattern));

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (

  <AuthProvider>
    <Router>
      <Layout>
        <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/booking-confirm" element={<BookingConfirmationPage />} />

          {/* Protected routes - authentication required */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          } />
          <Route path="/event/:id" element={
            <ProtectedRoute>
              <EventDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/my-tickets" element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          } />
          <Route path="/my-tickets/:id" element={
            <ProtectedRoute>
              <TicketDetailsPage />
            </ProtectedRoute>
          } />

          {/* Organizer-only routes */}
          <Route path="/organizer-dashboard" element={
            <ProtectedRoute requiredRole="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/create-event" element={
            <ProtectedRoute requiredRole="organizer">
              <CreateEventPage />
            </ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute requiredRole="admin">
              <div>Admin Dashboard (To be implemented)</div>
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
      {/* Toast Notifications (single instance) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      {/* Floating ChatBot */}
      <ChatBot />
    </Router>
  </AuthProvider>
  );
}

export default App;
