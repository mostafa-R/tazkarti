import axios from "axios";


const POSSIBLE_BASE_URLS = [
  import.meta.env.VITE_API_URL,
  "http://localhost:5000",
  "http://127.0.0.1:5000",
].filter(Boolean);

const api = axios.create({

  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const eventsAPI = {
  getAllEvents: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });
    return api.get(`/api/events?${queryParams}`);
  },

  searchEvents: async (searchParams = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(searchParams).forEach((key) => {
      if (searchParams[key] !== undefined && searchParams[key] !== "") {
        queryParams.append(key, searchParams[key]);
      }
    });

    try {
      return await api.get(`/api/events?${queryParams}`);
    } catch (error) {
      console.warn("Axios failed, trying fetch:", error.message);
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

  getEventById: (id) => api.get(`/api/events/${id}`),

  getUpcomingEvents: () => api.get("/api/events/upcoming"),

  createEvent: (eventData) =>
    api.post("/api/events/create", eventData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

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

export const ticketsAPI = {
  getTicketsForEvent: (eventId) => api.get(`/api/tickets/event/${eventId}`),

  getTicketById: (ticketId) => api.get(`/api/tickets/${ticketId}`),

  getAllTickets: () => api.get("/api/tickets"),
};

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),

  register: (userData) => api.post("/auth/register", userData),

  registerOrganizer: (organizerData) =>
    api.post("/auth/registerOrganizer", organizerData),

  verifyEmail: (email, code) => api.post("/auth/verifyOTP", { email, code }),

  logout: () => api.post("/auth/logout"),

  adminLogin: (credentials) => api.post("/auth/adminlogin", credentials),
};

export const userAPI = {
  getProfile: () => api.get("/user/profile"),

  updateProfile: (userData) => api.put("/user/update", userData),

  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append("profileImage", imageFile);
    return api.post("/user/upload-profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getMyBookings: () => api.get("/user/my-bookings"),
};

export const bookingAPI = {
  createSecureBooking: (bookingData) =>
    api.post("/api/booking/create-secure-booking", bookingData),

  cancelPendingBooking: (bookingId) =>
    api.delete(`/api/booking/cancel-pending/${bookingId}`),

  getBookingStatus: (bookingId) => api.get(`/api/booking/status/${bookingId}`),
  
  getTicketDetails: (bookingId) => api.get(`/api/booking/ticket/${bookingId}`),
  
  downloadTicket: (bookingId) => api.get(`/api/booking/ticket/${bookingId}/download`, {
    responseType: 'blob'
  }),
  
  regenerateQR: (bookingId) => api.get(`/api/booking/ticket/${bookingId}?regenerate=true`),

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

export const paymentAPI = {
  payWithToken: (paymentData) =>
    api.post("/api/booking/checkout/pay-with-token", paymentData),

  createPaymentLink: (paymentData) =>
    api.post("/api/booking/checkout/payment-link", paymentData),

  getPaymentDetails: (paymentId) =>
    api.get(`/api/booking/checkout/${paymentId}`),

  verifyPaymentStatus: (reference) =>
    api.get(`/api/booking/verify/${reference}`),

  retryPayment: (bookingId, paymentData) =>
    api.post(`/api/booking/retry/${bookingId}`, paymentData),

  cancelPayment: (bookingId) => api.post(`/api/booking/cancel/${bookingId}`),

  healthCheck: () => api.get("/api/booking/health"),
};

export default api;
