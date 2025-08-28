import axios from "axios";

// For development, try different base URLs if one fails
const POSSIBLE_BASE_URLS = [
  import.meta.env.VITE_API_URL,
  "http://localhost:5000",
  "http://127.0.0.1:5000",
].filter(Boolean);

const api = axios.create({
  // استخدام متغير البيئة من ملف .env
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Step 2: Add authentication token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (where we store it after login)
    const token = localStorage.getItem("authToken");
    if (token) {
      // Add token to request headers
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Step 3: Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token is invalid, clear storage and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Step 4: Create functions for different API calls
export const eventsAPI = {
  // Get all events from backend
  getAllEvents: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/api/events?${queryParams}`);
  },

  // Search events with filters
  searchEvents: async (searchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key] !== undefined && searchParams[key] !== "") {
        queryParams.append(key, searchParams[key]);
      }
    });

    // Try fetch as fallback for CORS issues
    try {
      return await api.get(`/api/events?${queryParams}`);
    } catch (error) {
      console.warn("Axios failed, trying fetch:", error.message);
      // استخدام نفس متغير البيئة كإحتياطي
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const url = `${baseUrl}/api/events?${queryParams}`;
      const token = localStorage.getItem("authToken");

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    }
  },

  // Get single event by ID
  getEventById: (id) => api.get(`/api/events/${id}`),

  // Get upcoming events
  getUpcomingEvents: () => api.get("/api/events/upcoming"),

  // Create new event (for organizers)
  createEvent: (eventData) =>
    api.post("/api/events/create", eventData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // NEW: Organizer-specific event management
  getMyEvents: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/api/events/organizer/my-events?${queryParams}`);
  },

  updateEvent: (eventId, eventData) =>
    api.put(`/api/events/${eventId}`, eventData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteEvent: (eventId) => api.delete(`/api/events/${eventId}`),
};

// NEW: Tickets API
export const ticketsAPI = {
  // Get all tickets for a specific event
  getTicketsForEvent: (eventId) => api.get(`/api/tickets/event/${eventId}`),

  // Get single ticket details
  getTicketById: (ticketId) => api.get(`/api/tickets/${ticketId}`),

  // Get all tickets (admin/organizer)
  getAllTickets: () => api.get("/api/tickets"),
};

export const authAPI = {
  // Login user
  login: (credentials) => api.post("/auth/login", credentials),

  // Register user
  register: (userData) => api.post("/auth/register", userData),

  // Register organizer
  registerOrganizer: (organizerData) =>
    api.post("/auth/registerOrganizer", organizerData),

  // Verify email
  verifyEmail: (email, code) => api.post("/auth/verifyOTP", { email, code }),

  // Logout
  logout: () => api.post("/auth/logout"),

  // Admin login
  adminLogin: (credentials) => api.post("/auth/adminlogin", credentials),
};

// User API
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get("/user/profile"),

  // Update user profile
  updateProfile: (userData) => api.put("/user/update", userData),

  // Upload profile image
  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append("profileImage", imageFile);
    return api.post("/user/upload-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Get user bookings/tickets
  getMyBookings: () => api.get("/user/my-bookings"),
};

// Booking API
export const bookingAPI = {
  // إنشاء حجز آمن مؤقت
  createSecureBooking: (bookingData) =>
    api.post("/api/booking/create-secure-booking", bookingData),

  // إلغاء حجز مؤقت
  cancelPendingBooking: (bookingId) =>
    api.delete(`/api/booking/cancel-pending/${bookingId}`),

  // الحصول على حالة الحجز
  getBookingStatus: (bookingId) => api.get(`/api/booking/status/${bookingId}`),

  // الحصول على قائمة الحجوزات للمستخدم
  getMyBookings: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/api/booking/my-bookings?${queryParams}`);
  },
};

// Payment API
export const paymentAPI = {
  // الدفع باستخدام توكن البطاقة
  payWithToken: (paymentData) =>
    api.post("/api/booking/checkout/pay-with-token", paymentData),

  // إنشاء رابط دفع
  createPaymentLink: (paymentData) =>
    api.post("/api/booking/checkout/payment-link", paymentData),

  // الحصول على تفاصيل الدفع
  getPaymentDetails: (paymentId) =>
    api.get(`/api/booking/checkout/${paymentId}`),
};

export default api;
