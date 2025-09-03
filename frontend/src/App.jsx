import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./Components/Navbar.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

// Pages
import ChatBot from "./Components/ChatWidget.jsx";
import EmailVerification from "./Components/EmailVerification.jsx";
import BookingPage from "./pages/Booking.jsx";
import BookingConfirmationPage from "./pages/BookingConfirmation.jsx";
import CreateEventPage from "./pages/CreateEvent.jsx";
import EventsPage from "./pages/Event.jsx";
import EventDetailsPage from "./pages/EventDetails.jsx";
import HomePage from "./pages/Home.jsx";
import LoginPage from "./pages/Login.jsx";
import ManageTickets from "./pages/ManageTickets.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx";
import PaymentPage from "./pages/Payment.jsx";
import ViewBookingsPage from "./pages/ViewBookings.jsx";

import Footer from "./Components/footer.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import MyTicketsPage from "./pages/Ticket.jsx";
import TicketDetailsPage from "./pages/TicketDetailsPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;

  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/booking-confirm",
    "/payment",
    "/verify-email",
  ];
  const hideNavbarPatterns = [
    "/event/",
    "/ticket/",
    "/my-tickets/",
    "/booking/",
    "/organizer-dashboard",
    "/admin-dashboard",
    "/create-event",
    "/manage-tickets",
    "/view-bookings",
    "/enhanced-booking-management",
  ]; // إضافة /booking/ للـ patterns

  const shouldHideNavbar =
    hideNavbarRoutes.includes(pathname) ||
    hideNavbarPatterns.some((pattern) => pathname.startsWith(pattern));

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public routes - no authentication required */}

              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/verify-email" element={<EmailVerification />} />

              <Route
                path="/booking-confirm"
                element={<BookingConfirmationPage />}
              />

              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route
                path="/search"
                element={<Navigate to="/events" replace />}
              />
              <Route path="/event/:id" element={<EventDetailsPage />} />

              <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/payment"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <MyTicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tickets/:id"
                element={
                  <ProtectedRoute>
                    <TicketDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute >
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Organizer-only routes */}
              <Route
                path="/organizer-dashboard"
                element={
                  <ProtectedRoute requiredRole="organizer">
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute requiredRole="organizer">
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-tickets"
                element={
                  <ProtectedRoute requiredRole="organizer">
                    <ManageTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view-bookings"
                element={
                  <ProtectedRoute requiredRole="organizer">
                    <ViewBookingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/enhanced-booking-management"
                element={
                  <ProtectedRoute requiredRole="organizer">
                    <ViewBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <div>Admin Dashboard (To be implemented)</div>
                  </ProtectedRoute>
                }
              />
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
      <Footer />
    </ErrorBoundary>
  );
}

export default App;
