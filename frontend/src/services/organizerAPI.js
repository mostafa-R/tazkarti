import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const organizerAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
organizerAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
organizerAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const authService = {
  registerOrganizer: async (organizerData) => {
    const response = await organizerAPI.post('/auth/registerOrganizer', organizerData);
    return response.data;
  },

  verifyEmail: async (email, code) => {
    const response = await organizerAPI.post('/auth/verifyOTP', { email, code });
    return response.data;
  },

  login: async (email, password) => {
    const response = await organizerAPI.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await organizerAPI.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }
};

// Event Management Services
export const eventService = {
  createEvent: async (eventData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(eventData).forEach(key => {
      if (key !== 'images' && key !== 'trailerVideo') {
        if (typeof eventData[key] === 'object') {
          formData.append(key, JSON.stringify(eventData[key]));
        } else {
          formData.append(key, eventData[key]);
        }
      }
    });

    // Append files
    if (eventData.images && eventData.images.length > 0) {
      eventData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    if (eventData.trailerVideo) {
      formData.append('trailerVideo', eventData.trailerVideo);
    }

    const response = await organizerAPI.post('/api/events/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyEvents: async (params = {}) => {
    const { page = 1, limit = 10, status, approved } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(approved !== undefined && { approved: approved.toString() })
    });

    const response = await organizerAPI.get(`/api/events/organizer/my-events?${queryParams}`);
    return response.data;
  },

  updateEvent: async (eventId, eventData) => {
    const formData = new FormData();
    
    Object.keys(eventData).forEach(key => {
      if (key !== 'images' && key !== 'trailerVideo') {
        if (typeof eventData[key] === 'object') {
          formData.append(key, JSON.stringify(eventData[key]));
        } else {
          formData.append(key, eventData[key]);
        }
      }
    });

    if (eventData.images && eventData.images.length > 0) {
      eventData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    if (eventData.trailerVideo) {
      formData.append('trailerVideo', eventData.trailerVideo);
    }

    const response = await organizerAPI.put(`/api/events/${eventId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteEvent: async (eventId) => {
    const response = await organizerAPI.delete(`/api/events/${eventId}`);
    return response.data;
  },

  getEventById: async (eventId) => {
    const response = await organizerAPI.get(`/api/events/${eventId}`);
    return response.data;
  }
};

// Ticket Management Services
export const ticketService = {
  createTicket: async (ticketData) => {
    const response = await organizerAPI.post('/api/tickets', ticketData);
    return response.data;
  },

  getEventTickets: async (eventId) => {
    const response = await organizerAPI.get(`/api/tickets/event/${eventId}`);
    return response.data;
  },

  updateTicket: async (ticketId, ticketData) => {
    const response = await organizerAPI.put(`/api/tickets/${ticketId}`, ticketData);
    return response.data;
  },

  deleteTicket: async (ticketId) => {
    const response = await organizerAPI.delete(`/api/tickets/${ticketId}`);
    return response.data;
  },

  getTicketById: async (ticketId) => {
    const response = await organizerAPI.get(`/api/tickets/${ticketId}`);
    return response.data;
  }
};

// Booking Management Services
export const bookingService = {
  getMyBookings: async (params = {}) => {
    const { page = 1, limit = 10, status, paymentStatus, search } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(search && { search })
    });

    const response = await organizerAPI.get(`/api/booking/organizer/bookings?${queryParams}`);
    return response.data;
  },

  getBookingStats: async (params = {}) => {
    const { eventId, startDate, endDate } = params;
    const queryParams = new URLSearchParams({
      ...(eventId && { eventId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });

    const response = await organizerAPI.get(`/api/booking/organizer/bookings/stats?${queryParams}`);
    return response.data;
  },

  getEventBookings: async (eventId, params = {}) => {
    const { page = 1, limit = 10, status } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });

    const response = await organizerAPI.get(`/api/booking/organizer/events/${eventId}/bookings?${queryParams}`);
    return response.data;
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await organizerAPI.put(`/api/booking/organizer/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await organizerAPI.get(`/api/booking/organizer/bookings/${bookingId}`);
    return response.data;
  }
};

// Dashboard Services
export const dashboardService = {
  getDashboardData: async () => {
    try {
      const [eventsResponse, statsResponse, bookingsResponse] = await Promise.all([
        eventService.getMyEvents({ limit: 5 }),
        bookingService.getBookingStats(),
        bookingService.getMyBookings({ limit: 5 })
      ]);

      return {
        events: eventsResponse.events || [],
        stats: statsResponse,
        recentBookings: bookingsResponse.bookings || []
      };
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      throw error;
    }
  }
};

// Utility functions
export const utils = {
  isOrganizer: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'organizer';
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem('user') || '{}');
  },

  formatCurrency: (amount, currency = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

export default {
  auth: authService,
  events: eventService,
  tickets: ticketService,
  bookings: bookingService,
  dashboard: dashboardService,
  utils
};
