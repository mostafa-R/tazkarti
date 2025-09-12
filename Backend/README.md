# 🎫 Tazkarti Backend API

A robust, scalable Node.js + Express.js backend API for the Tazkarti event management platform. Built with modern JavaScript practices, comprehensive security features, and extensive documentation.

## 🌟 Features

### 🔐 Authentication & Security

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (User, Organizer, Admin)
- **OAuth Integration** (Google OAuth 2.0)
- **Password Hashing** with bcrypt
- **Email Verification** system
- **Rate Limiting** and security headers
- **Input Validation** with Joi
- **CORS Configuration** for cross-origin requests

### 🎟️ Event & Ticket Management

- **Event CRUD Operations** with image uploads
- **Dynamic Ticket Types** and pricing
- **QR Code Generation** with encryption
- **Secure Ticket Verification** system
- **Real-time Inventory Management**
- **Event Analytics** and reporting
- **Event Approval** workflow for admins

### 💳 Payment Processing

- **Checkout.com Integration** for secure payments
- **Webhook Verification** for payment confirmation
- **Payment Status Tracking** and updates
- **Automatic Refund Handling**
- **Transaction Audit Trail**
- **Multi-currency Support**

### 📊 Analytics & Reporting

- **Real-time Analytics** dashboard
- **Event Performance Metrics**
- **Revenue Tracking** and reporting
- **User Engagement Statistics**
- **Booking Analytics** and insights
- **Custom Report Generation**

### 🔧 System Features

- **Comprehensive Logging** with Winston
- **Error Handling** middleware
- **Performance Monitoring**
- **Database Optimization**
- **Caching** with Redis
- **Email Notifications** with templates
- **File Upload** with Cloudinary
- **Automated Cleanup** jobs

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **Redis** (optional, for sessions)
- **Git**

### Installation

1. **Clone and navigate to Backend**

   ```bash
   git clone https://github.com/your-username/tazkarti.git
   cd tazkarti/Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Access API**
   - **API Base URL**: `http://localhost:5000`
   - **Documentation**: `http://localhost:5000/docs`
   - **Health Check**: `http://localhost:5000/health`

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/tazkarti
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Service (Nodemailer)
EMAIL_FROM=noreply@tazkarti.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateway (Checkout.com)
CKO_SECRET_KEY=sk_test_your-secret-key
CKO_PUBLIC_KEY=pk_test_your-public-key
CKO_WEBHOOK_SECRET=whsec_your-webhook-secret
CKO_ENV=sandbox

# QR Code & Encryption
QR_CODE_SECRET=your-qr-code-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Settings
APP_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
DASHBOARD_URL=http://localhost:4200
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📁 Project Structure

```
Backend/
├── 📂 src/
│   ├── 📂 config/              # Configuration files
│   │   ├── database.js         # MongoDB connection
│   │   ├── email.js           # Email service config
│   │   ├── passport.js        # OAuth configuration
│   │   └── swagger.js         # API documentation
│   │
│   ├── 📂 controllers/         # Business logic (11 controllers)
│   │   ├── analyticsController.js    # Analytics & reporting
│   │   ├── authController.js         # Authentication
│   │   ├── booking.controller.js     # Booking management
│   │   ├── bookingTicket.js         # Ticket operations
│   │   ├── chatController.js        # AI chat functionality
│   │   ├── checkout.controller.js   # Payment processing
│   │   ├── eventController.js       # Event management
│   │   ├── paymentStatus.controller.js # Payment status
│   │   ├── reportController.js      # Report generation
│   │   ├── ticketController.js      # Ticket management
│   │   └── userController.js        # User management
│   │
│   ├── 📂 middleware/          # Custom middleware
│   │   ├── authMiddleware.js   # JWT authentication
│   │   ├── errorMiddleware.js  # Error handling
│   │   ├── performanceMiddleware.js # Performance monitoring
│   │   ├── roleMiddleware.js   # Role-based access
│   │   └── uploads/            # File upload handlers
│   │       ├── eventUpload.js  # Event image uploads
│   │       └── profileUpload.js # Profile image uploads
│   │
│   ├── 📂 models/              # Database schemas (7 models)
│   │   ├── ArchivedUser.js     # Deleted user data
│   │   ├── Booking.js          # Booking records
│   │   ├── Event.js            # Event information
│   │   ├── Notification.js     # System notifications
│   │   ├── Payment.js          # Payment transactions
│   │   ├── Ticket.js           # Ticket types
│   │   └── User.js             # User accounts
│   │
│   ├── 📂 routes/              # API endpoints (8 route files)
│   │   ├── analyticsRoutes.js  # Analytics endpoints
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── booking.routes.js   # Booking endpoints
│   │   ├── chatRoutes.js       # Chat API routes
│   │   ├── eventRoutes.js      # Event endpoints
│   │   ├── paymentStatus.routes.js # Payment status
│   │   ├── reportRoutes.js     # Report endpoints
│   │   ├── ticketRoutes.js     # Ticket endpoints
│   │   └── userRoutes.js       # User endpoints
│   │
│   ├── 📂 services/            # Business services (4 services)
│   │   ├── cacheService.js     # Redis caching
│   │   ├── emailService.js     # Email notifications
│   │   ├── qrCodeService.js    # QR code generation
│   │   └── sessionService.js   # Session management
│   │
│   ├── 📂 swagger/             # API documentation (7 files)
│   │   ├── auth.swagger.js     # Auth endpoints docs
│   │   ├── bookings.swagger.js # Booking endpoints docs
│   │   ├── chat.swagger.js     # Chat endpoints docs
│   │   ├── events.swagger.js   # Event endpoints docs
│   │   ├── payments.swagger.js # Payment endpoints docs
│   │   ├── tickets.swagger.js  # Ticket endpoints docs
│   │   └── users.swagger.js    # User endpoints docs
│   │
│   ├── 📂 utils/               # Helper functions (8 utilities)
│   │   ├── archiveOldUsers.js  # User archiving
│   │   ├── cleanupExpiredBookings.js # Booking cleanup
│   │   ├── cloudinary.js       # Image upload utility
│   │   ├── emailTemplates.js   # Email templates
│   │   ├── jwt.js              # JWT utilities
│   │   ├── logger.js           # Logging configuration
│   │   └── sendNotification.js # Notification service
│   │
│   ├── 📂 validators/          # Data validation
│   │   └── dynvalidation.js    # Dynamic validation rules
│   │
│   └── 📄 server.js            # Application entry point
│
├── 📂 uploads/                 # File uploads directory
├── 📂 logs/                    # Application logs
├── 📄 package.json            # Dependencies and scripts
├── 📄 Dockerfile              # Docker configuration
├── 📄 fly.toml               # Fly.io deployment config
└── 📄 README.md              # This file
```

## 🛠️ Available Scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `npm start`            | Start production server               |
| `npm run dev`          | Start development server with nodemon |
| `npm run format`       | Format code with Prettier             |
| `npm run format:check` | Check code formatting                 |
| `npm run clean`        | Clean install dependencies            |
| `npm run docs`         | Display documentation URL             |

## 🔌 API Endpoints

### Authentication Endpoints

```
POST   /auth/register              # User registration
POST   /auth/registerOrganizer     # Organizer registration
POST   /auth/login                 # User login
POST   /auth/logout                # User logout
POST   /auth/refresh               # Refresh JWT token
POST   /auth/forgot-password       # Password reset request
POST   /auth/reset-password        # Password reset
POST   /auth/verify-email          # Email verification
GET    /auth/google                # Google OAuth
GET    /auth/google/callback       # Google OAuth callback
```

### User Management

```
GET    /user/profile               # Get user profile
PUT    /user/profile               # Update user profile
DELETE /user/profile               # Delete user account
GET    /user/bookings              # Get user bookings
GET    /user/events                # Get user events (organizer)
```

### Event Management

```
GET    /api/events                 # Get all events
GET    /api/events/:id             # Get event by ID
POST   /api/events                 # Create new event
PUT    /api/events/:id             # Update event
DELETE /api/events/:id             # Delete event
GET    /api/events/search          # Search events
GET    /api/events/category/:category # Get events by category
```

### Ticket Management

```
GET    /api/tickets                # Get all tickets
GET    /api/tickets/:id            # Get ticket by ID
POST   /api/tickets                # Create new ticket
PUT    /api/tickets/:id            # Update ticket
DELETE /api/tickets/:id            # Delete ticket
GET    /api/tickets/event/:eventId # Get tickets for event
```

### Booking Management

```
GET    /api/booking                # Get all bookings
GET    /api/booking/:id            # Get booking by ID
POST   /api/booking                # Create new booking
PUT    /api/booking/:id            # Update booking
DELETE /api/booking/:id            # Cancel booking
GET    /api/booking/user/:userId   # Get user bookings
```

### Payment Processing

```
POST   /api/booking/checkout       # Initiate payment
POST   /api/booking/checkout/webhook # Payment webhook
GET    /api/payment/status/:id     # Get payment status
POST   /api/payment/refund         # Process refund
```

### Analytics & Reporting

```
GET    /api/analytics/dashboard    # Dashboard analytics
GET    /api/analytics/events       # Event analytics
GET    /api/analytics/revenue      # Revenue analytics
GET    /api/analytics/users        # User analytics
GET    /api/reports/events         # Event reports
GET    /api/reports/bookings       # Booking reports
```

## 🔐 Security Features

### Authentication Security

- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token renewal
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Session Management**: Secure session handling

### Data Protection

- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Controlled cross-origin access
- **Helmet.js**: Security headers

### Payment Security

- **Webhook Verification**: Signature validation
- **PCI Compliance**: Secure payment processing
- **Encrypted QR Codes**: Secure ticket verification
- **Audit Trail**: Complete transaction logging

## 📊 Database Schema

### User Model

```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (user/organizer/admin),
  address: {
    country: String,
    city: String,
    street: String,
    zip: String
  },
  isEmailVerified: Boolean,
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model

```javascript
{
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  location: {
    venue: String,
    city: String,
    address: String
  },
  organizer: ObjectId (User),
  images: [String],
  category: String,
  maxAttendees: Number,
  currentAttendees: Number,
  status: String (draft/published/cancelled),
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket Model

```javascript
{
  event: ObjectId (Event),
  name: String,
  description: String,
  price: Number,
  quantity: Number,
  soldQuantity: Number,
  type: String (general/vip/early-bird),
  validFrom: Date,
  validUntil: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model

```javascript
{
  user: ObjectId (User),
  event: ObjectId (Event),
  tickets: [{
    ticket: ObjectId (Ticket),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String (pending/confirmed/cancelled),
  paymentId: String,
  qrCode: String,
  bookingDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Production Deployment (Fly.io)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
fly auth login

# Deploy application
fly deploy
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tazkarti
REDIS_URL=redis://your-redis-url:6379
FRONTEND_URL=https://tazkarti.vercel.app
```

### Docker Deployment

```bash
# Build Docker image
docker build -t tazkarti-backend .

# Run container
docker run -p 5000:5000 --env-file .env tazkarti-backend
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/api-docs`
- **OpenAPI Spec**: `http://localhost:5000/swagger.json`

### Documentation Features

- **Interactive Testing**: Test endpoints directly from docs
- **Request/Response Examples**: Complete examples for all endpoints
- **Authentication**: Built-in auth testing
- **Schema Validation**: Request/response validation
- **Code Generation**: Generate client SDKs

## 🧪 Testing

### Test Structure

```
tests/
├── unit/                 # Unit tests
├── integration/          # Integration tests
├── e2e/                  # End-to-end tests
└── fixtures/             # Test data
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Authentication"

# Run with coverage
npm run test:coverage
```

## 📈 Performance & Monitoring

### Performance Features

- **Redis Caching**: Session and data caching
- **Database Indexing**: Optimized queries
- **Compression**: Gzip compression
- **Rate Limiting**: API rate limiting
- **Connection Pooling**: Database connection optimization

### Monitoring

- **Winston Logging**: Comprehensive logging system
- **Error Tracking**: Centralized error handling
- **Health Checks**: System health monitoring
- **Performance Metrics**: Response time tracking
- **Automated Cleanup**: Background job processing

## 🔧 Development

### Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting
- **EditorConfig**: Unified editor settings
- **Git Hooks**: Pre-commit validation

### Development Tools

- **Nodemon**: Auto-restart on changes
- **Morgan**: HTTP request logging
- **CORS**: Cross-origin request handling
- **Helmet**: Security headers

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with descriptive messages
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Standards

- Follow ESLint configuration
- Use Prettier for formatting
- Write comprehensive tests
- Document new endpoints
- Follow RESTful conventions

## 🆘 Support

### Getting Help

- **API Documentation**: Visit `/docs` endpoint
- **Issues**: Create GitHub issues
- **Discussions**: Use GitHub Discussions
- **Email**: support@tazkarti.com

### Team Members

- **Mostafa Ramadan** - [@mostafa-R](https://github.com/mostafa-R)
- **Zyad Saeed** - [@ZyadSaeed22](https://github.com/ZyadSaeed22)
- **Mostafa Sayed** - [@mostafasayed0](https://github.com/mostafasayed0)
- **Mariam Mahmoud** - [@MariamHammouda](https://github.com/MariamHammouda)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using modern Node.js practices**

_Powering the Tazkarti event management platform_ 🎫
