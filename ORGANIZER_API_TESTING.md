# Organizer API Testing Guide

## 🔧 **Setup**
1. Start your backend server
2. Use Postman, Thunder Client, or any API testing tool
3. Base URL: `http://localhost:3000/api` (adjust port as needed)

## 🔐 **Authentication Flow**

### 1. Register Organizer
```http
POST /auth/register-organizer
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "organizer@test.com",
  "password": "password123",
  "confirmPassword": "password123",
  "phone": "01234567890",
  "organizationName": "Event Masters",
  "organizationDescription": "Professional event management",
  "address": {
    "country": "Egypt",
    "city": "Cairo", 
    "street": "123 Main St",
    "zip": "12345"
  }
}
```

### 2. Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "email": "organizer@test.com",
  "code": "123456"
}
```

### 3. Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "organizer@test.com",
  "password": "password123"
}
```
**Save the token from response for subsequent requests!**

## 📅 **Event Management**

### 4. Create Event
```http
POST /events/create
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "category": "Technology",
  "startDate": "2024-06-15",
  "endDate": "2024-06-16", 
  "time": "09:00",
  "location": "{\"address\":\"Cairo Convention Center\",\"city\":\"Cairo\"}",
  "maxAttendees": 500,
  "upcoming": true,
  "tags": ["tech", "conference"]
}
```

### 5. Get My Events
```http
GET /events/organizer/my-events?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

### 6. Update Event
```http
PUT /events/{EVENT_ID}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "title": "Updated Tech Conference 2024",
  "description": "Updated description",
  "maxAttendees": 600
}
```

### 7. Delete Event
```http
DELETE /events/{EVENT_ID}
Authorization: Bearer YOUR_TOKEN
```

## 🎫 **Ticket Management**

### 8. Create Ticket
```http
POST /tickets
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "eventId": "EVENT_ID",
  "type": "Standard",
  "price": 100,
  "quantity": 200,
  "availableQuantity": 200,
  "description": "Standard access ticket",
  "features": ["General admission", "Welcome kit"]
}
```

### 9. Get Event Tickets
```http
GET /tickets/event/{EVENT_ID}
```

### 10. Update Ticket
```http
PUT /tickets/{TICKET_ID}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "price": 120,
  "availableQuantity": 180
}
```

### 11. Delete Ticket
```http
DELETE /tickets/{TICKET_ID}
Authorization: Bearer YOUR_TOKEN
```

## 📋 **Booking Management**

### 12. Get All My Bookings
```http
GET /bookings/organizer/bookings?page=1&limit=10
Authorization: Bearer YOUR_TOKEN
```

### 13. Get Booking Statistics
```http
GET /bookings/organizer/bookings/stats
Authorization: Bearer YOUR_TOKEN
```

### 14. Get Event Bookings
```http
GET /bookings/organizer/events/{EVENT_ID}/bookings
Authorization: Bearer YOUR_TOKEN
```

### 15. Update Booking Status
```http
PUT /bookings/organizer/bookings/{BOOKING_ID}/status
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "confirmed"
}
```

## ✅ **Testing Checklist**

- [ ] Organizer registration works
- [ ] Email verification works
- [ ] Login returns valid token
- [ ] Create event works (check approval status)
- [ ] Get my events returns only organizer's events
- [ ] Update event works with ownership validation
- [ ] Delete event prevents deletion with bookings
- [ ] Create tickets for events
- [ ] Update/delete tickets work
- [ ] Booking endpoints return correct data
- [ ] Role-based access control works (try with regular user token)

## 🚨 **Expected Behaviors**

1. **New events** should have `approved: false` initially
2. **Only organizers** can access organizer endpoints
3. **Ownership validation** prevents editing other's events/tickets
4. **Events with bookings** cannot be deleted
5. **Pagination** works for large datasets

## 🔍 **Common Issues**

- **401 Unauthorized**: Check token in Authorization header
- **403 Forbidden**: User role is not "organizer"
- **404 Not Found**: Event/ticket doesn't exist or wrong ownership
- **400 Bad Request**: Missing required fields or invalid data format
