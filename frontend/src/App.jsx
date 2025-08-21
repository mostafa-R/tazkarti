import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar.jsx';

// Pages
import HomePage from './pages/Home.jsx';
import EventsPage from './pages/Event.jsx';
import EventDetailsPage from './pages/EventDetails.jsx';
import BookingPage from './pages/Booking.jsx';
import LoginPage from './pages/Login.jsx';
import SignUpPage from './pages/Signup.jsx';
import BookingConfirmationPage from './pages/BookingConfirmation.jsx';
import PaymentPage from './pages/Payment.jsx';
import MyTicketsPage from './pages/Ticket.jsx';
import TicketDetailsPage from './pages/TicketDetailsPage.jsx';

// ✅ ChatBot Component
import ChatBot from './Components/ChatWidget.jsx';

import SignupPage from './pages/SignupPage.jsx'; 

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const hideNavbarRoutes = ['/', '/login', '/signup', '/booking-confirm', '/payment'];
  const hideNavbarPatterns = ['/event/', '/ticket/', '/my-tickets/', '/booking/'];

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
    <Router>
      <Layout>
        <Routes>
          {/* صفحات بدون Navbar */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/booking-confirm" element={<BookingConfirmationPage />} />


          {/* صفحات مع Navbar */}
          <Route path="/home" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/my-tickets/:id" element={<TicketDetailsPage />} /> 

          <Route path="/signupPage" element={<SignupPage/>} />
        </Routes>
      </Layout>

      {/* ✅ Toast Notifications */}
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

      {/* ✅ Floating ChatBot */}
      <ChatBot />
    </Router>
  );
}

export default App;
