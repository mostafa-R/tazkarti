

import axios from 'axios';

// Step 1: Create an axios instance with your backend URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend server URL
  withCredentials: true, // This allows cookies to be sent
});

// Step 2: Add authentication token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (where we store it after login)
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Step 4: Create functions for different API calls
export const eventsAPI = {
  // Get all events from backend
  getAllEvents: () => api.get('/api/events'),
  
  // Get single event by ID
  getEventById: (id) => api.get(`/api/events/${id}`),
  
  // Create new event (for organizers)
  createEvent: (eventData) => api.post('/api/events/create', eventData),
};

// NEW: Tickets API
export const ticketsAPI = {
  // Get all tickets for a specific event
  getTicketsForEvent: (eventId) => api.get(`/api/tickets/event/${eventId}`),
  
  // Get single ticket details
  getTicketById: (ticketId) => api.get(`/api/tickets/${ticketId}`),
  
  // Get all tickets (admin/organizer)
  getAllTickets: () => api.get('/api/tickets'),
};

export const authAPI = {
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register user
  register: (userData) => api.post('/auth/register', userData),
  
  // Register organizer
  registerOrganizer: (organizerData) => api.post('/auth/registerOrganizer', organizerData),
  
  // Verify email
  verifyEmail: (email, code) => api.post('/auth/verifyOTP', { email, code }),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Admin login
  adminLogin: (credentials) => api.post('/auth/adminlogin', credentials),
};




export default api;





