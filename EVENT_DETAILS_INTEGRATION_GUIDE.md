# Event Details Integration Guide

## Overview
This guide explains how to integrate the Event Details page with the backend API to display real event data instead of hardcoded mock data.

## Current State Analysis

### **✅ What We Have:**

**Backend:**
1. **Event Controller** (`Backend/src/controllers/eventController.js`):
   - ✅ `getEventById(id)` function exists
   - ✅ Fetches event with organizer and tickets data
   - ✅ Proper error handling
   - ✅ Populates organizer and tickets data

**Frontend:**
1. **API Service** (`frontend/src/services/api.js`):
   - ✅ `eventsAPI.getEventById(id)` function exists
   - ✅ Authentication and error handling

### **❌ What Was Missing:**

1. **Event Details Page** (`frontend/src/pages/EventDetails.jsx`):
   - ❌ Used hardcoded data instead of API
   - ❌ No loading or error states
   - ❌ No real API integration

## Step-by-Step Integration Process

### **Step 1: Understanding the Problem**

**Before**: EventDetails page used hardcoded data:
```javascript
const defaultEvents = {
  '1': {
    id: '1',
    title: 'Rock Concert 2024',
    // ... hardcoded data
  }
};
```

**After**: EventDetails page fetches real data from backend:
```javascript
const [event, setEvent] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

### **Step 2: What We Changed**

#### **2.1 Added State Management**
```javascript
// NEW: Add state for real event data
const [event, setEvent] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**Why**: We need to manage the loading state, error state, and actual event data.

#### **2.2 Added API Integration Function**
```javascript
const fetchEventDetails = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Call the API to get event details
    const response = await eventsAPI.getEventById(id);
    
    // Update state with real event data
    setEvent(response.data);
    
  } catch (err) {
    console.error('Error fetching event details:', err);
    setError('Failed to load event details');
    
    // Fallback to mock data if API fails
    setEvent({...fallbackData});
  } finally {
    setLoading(false);
  }
};
```

**Why**: This function handles the API call, error handling, and fallback data.

#### **2.3 Added useEffect Hook**
```javascript
useEffect(() => {
  if (id) {
    fetchEventDetails();
  }
}, [id]);
```

**Why**: This ensures the API is called when the component loads or when the event ID changes.

#### **2.4 Added Loading State**
```javascript
if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading event details...</p>
      </div>
    </div>
  );
}
```

**Why**: Users need to see a loading indicator while data is being fetched.

#### **2.5 Added Error State**
```javascript
if (error && !event) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchEventDetails}>Try Again</button>
      </div>
    </div>
  );
}
```

**Why**: Users need to know when something goes wrong and have a way to retry.

#### **2.6 Added No Event Found State**
```javascript
if (!event) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">Event not found.</p>
        <button onClick={() => navigate('/events')}>Back to Events</button>
      </div>
    </div>
  );
}
```

**Why**: Handle cases where the event doesn't exist.

### **Step 3: Data Structure Mapping**

#### **Backend Data Structure:**
```javascript
{
  _id: "event_id",
  title: "Event Title",
  description: "Event description",
  startDate: "2024-03-15",
  time: "20:00",
  location: {
    venue: "Stadium Arena",
    city: "New York",
    address: "123 Main Street"
  },
  images: ["image_url_1", "image_url_2"],
  category: "music",
  organizer: {
    name: "Organizer Name",
    email: "organizer@email.com"
  },
  maxAttendees: 2500,
  currentAttendees: 1800,
  status: "published"
}
```

#### **Frontend Data Usage:**
```javascript
// Before (hardcoded)
event.image → event.images[0]
event.date → event.startDate
event.location → event.location.venue + event.location.city
event.organizer → event.organizer.name
```

### **Step 4: Helper Functions**

#### **4.1 Ticket Price Helper**
```javascript
const getTicketPrice = (ticketType) => {
  const prices = {
    'Regular': 45,
    'VIP': 85,
    'Premium': 120
  };
  return prices[ticketType] || 45;
};
```

**Why**: Since the backend doesn't have ticket pricing yet, we use a helper function for now.

## File-by-File Explanation

### **1. Backend Files**

#### **`Backend/src/controllers/eventController.js`**
```javascript
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id).populate([
      { path: "organizer", select: "name email" },
      { path: "tickets" },
    ]);
    
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**What it does:**
- Takes event ID from URL parameters
- Finds event in database by ID
- Populates organizer and tickets data
- Returns event data or 404 error

#### **`Backend/src/routes/eventRoutes.js`**
```javascript
router.get("/:id", getEventById);
```

**What it does:**
- Defines the route `/events/:id` to get single event
- Maps to the `getEventById` controller function

### **2. Frontend Files**

#### **`frontend/src/services/api.js`**
```javascript
export const eventsAPI = {
  getEventById: (id) => api.get(`/events/${id}`),
};
```

**What it does:**
- Provides a function to call the backend API
- Handles authentication and error handling automatically

#### **`frontend/src/pages/EventDetails.jsx`**
**What we changed:**
1. **Imports**: Added `useEffect` and `eventsAPI`
2. **State**: Added `event`, `loading`, `error` states
3. **API Integration**: Added `fetchEventDetails` function
4. **Lifecycle**: Added `useEffect` to fetch data on component mount
5. **UI States**: Added loading, error, and not found states
6. **Data Mapping**: Updated to use backend data structure

## Testing the Integration

### **Step 1: Test with Real Data**
1. Start your backend server
2. Make sure you have events in your database
3. Visit `/event/[event_id]` in your frontend
4. Verify real data is displayed

### **Step 2: Test Error Handling**
1. Try visiting `/event/nonexistent-id`
2. Verify error state is shown
3. Test "Try Again" button

### **Step 3: Test Loading State**
1. Check network tab to see loading state
2. Verify loading spinner appears

## Common Issues & Solutions

### **Issue: "Event not found" error**
**Solution**: Check if the event ID exists in your database

### **Issue: "Failed to load event details" error**
**Solution**: Check if backend server is running and accessible

### **Issue: Data not displaying correctly**
**Solution**: Check if backend data structure matches frontend expectations

### **Issue: Images not loading**
**Solution**: Check if image URLs in database are valid

## Next Steps

### **Phase 1: Complete Event Details**
1. ✅ API integration (COMPLETED)
2. ✅ Loading and error states (COMPLETED)
3. ✅ Data mapping (COMPLETED)

### **Phase 2: Add More Features**
1. **Ticket Integration**: Connect to real ticket data
2. **Booking Integration**: Connect booking flow
3. **Related Events**: Show real related events
4. **Event Reviews**: Add review system

### **Phase 3: Enhancements**
1. **Image Gallery**: Show multiple event images
2. **Event Sharing**: Add social sharing
3. **Event Calendar**: Add to calendar functionality
4. **Event Updates**: Real-time updates

## Success Metrics

- [ ] Event details load from backend API
- [ ] Loading state works correctly
- [ ] Error handling works gracefully
- [ ] Data displays correctly
- [ ] Navigation works properly
- [ ] Booking flow connects correctly

This integration provides a solid foundation for displaying real event data and can be extended with additional features as needed. 