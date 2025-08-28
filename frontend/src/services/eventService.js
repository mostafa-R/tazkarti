// API service for event-related operations
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

class EventService {
  // Get all upcoming events (upcoming: true AND approved: true)
  static async getUpcomingEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/events/upcoming`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Failed to fetch upcoming events",
      };
    }
  }

  // Get all events
  static async getAllEvents() {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching all events:", error);
      return {
        success: false,
        data: [],
        error: error.message || "Failed to fetch events",
      };
    }
  }

  // Get event by ID
  static async getEventById(eventId) {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      console.error("Error fetching event:", error);
      return {
        success: false,
        data: null,
        error: error.message || "Failed to fetch event",
      };
    }
  }

  // Helper method to format date for display
  static formatEventDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString; // Return original string if formatting fails
    }
  }

  // Helper method to get default image if event image is missing
  static getEventImage(event) {
    if (event.images && event.images.length > 0) {
      return event.images[0];
    }

    // Return category-based default images
    const defaultImages = {
      music:
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=300&fit=crop",
      sports:
        "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=300&fit=crop",
      theater:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      conference:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      workshop:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
      other:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
    };

    return defaultImages[event.category] || defaultImages.other;
  }
}

export default EventService;
