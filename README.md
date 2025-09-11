# 🎫 Tazkarti - Complete Event Management Platform

A comprehensive, full-stack event management and ticketing platform built with modern technologies. Tazkarti provides a complete solution for event organizers to create, manage, and sell tickets for their events, while offering users a seamless experience to discover and purchase tickets.

## 🌟 Platform Overview

Tazkarti is a multi-role platform consisting of three main applications:

- **🎪 Frontend (React)** - User-facing web application
- **⚙️ Backend (Node.js)** - RESTful API and business logic
- **📊 Dashboard (Angular)** - Admin and organizer management interface

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Dashboard     │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Angular)     │
│                 │    │                 │    │                 │
│ • User Portal   │    │ • REST API      │    │ • Admin Panel   │
│ • Event Browse  │    │ • Authentication│    │ • Analytics     │
│ • Ticket Buy    │    │ • Payment Proc. │    │ • Management    │
│ • User Profile  │    │ • QR Generation │    │ • Reports       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (MongoDB)     │
                    │                 │
                    │ • Users         │
                    │ • Events        │
                    │ • Tickets       │
                    │ • Bookings      │
                    │ • Payments      │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **Git**
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mostafa-R/tazkarti.git
   cd tazkarti
   ```

2. **Install all dependencies**

   ```bash
   # Install Backend dependencies
   cd Backend && npm install && cd ..

   # Install Frontend dependencies
   cd frontend && npm install && cd ..

   # Install Dashboard dependencies
   cd Dashboard && npm install && cd ..
   ```

3. **Environment Setup**

   ```bash
   # Copy environment files
   cp Backend/.env.example Backend/.env
   cp frontend/.env.example frontend/.env
   cp Dashboard/.env.example Dashboard/.env
   ```

4. **Start all services**

   ```bash
   # Terminal 1 - Backend
   cd Backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev

   # Terminal 3 - Dashboard
   cd Dashboard && npm start
   ```

## 📱 Applications

### 🎪 Frontend (React)

**Location**: `./frontend/`
**Port**: `http://localhost:5173`
**Purpose**: User-facing web application

**Features**:

- Event discovery and browsing
- User registration and authentication
- Ticket purchasing and management
- User profile and booking history
- Multi-language support (Arabic/English)
- Responsive design for all devices

**Tech Stack**:

- React 19 with Vite
- Tailwind CSS
- React Router DOM
- Axios for API calls
- React i18next for internationalization

### ⚙️ Backend (Node.js)

**Location**: `./Backend/`
**Port**: `http://localhost:5000`
**Purpose**: RESTful API and business logic

**Features**:

- JWT-based authentication
- Event and ticket management
- Payment processing (Checkout.com)
- QR code generation and verification
- Email notifications
- Real-time analytics
- Comprehensive API documentation

**Tech Stack**:

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Swagger for API documentation
- Winston for logging
- Nodemailer for emails

### 📊 Dashboard (Angular)

**Location**: `./Dashboard/`
**Port**: `http://localhost:4200`
**Purpose**: Admin and organizer management interface

**Features**:

- Admin dashboard with analytics
- Event management and approval
- User management and roles
- Ticket management
- Booking oversight
- Revenue tracking and reports

**Tech Stack**:

- Angular 17 with SSR
- Bootstrap 5
- Chart.js for analytics
- Angular Material
- TypeScript

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
MONGO_URI=mongodb://localhost:27017/tazkarti

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Email
EMAIL_FROM=noreply@tazkarti.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment (Checkout.com)
CKO_SECRET_KEY=sk_your-secret-key
CKO_WEBHOOK_SECRET=whsec_your-webhook-secret
CKO_ENV=sandbox

# App
APP_BASE_URL=http://localhost:5000
PORT=5000
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
```

#### Dashboard (.env)

```env
API_URL=http://localhost:5000
DASHBOARD_URL=http://localhost:4200
```

## 🗄️ Database Schema

### Core Collections

- **Users** - User accounts and profiles
- **Events** - Event information and details
- **Tickets** - Ticket types and pricing
- **Bookings** - User reservations and purchases
- **Payments** - Payment transactions and status
- **Notifications** - System notifications
- **ArchivedUsers** - Deleted user data

### Key Relationships

- Users can create multiple Events (Organizers)
- Events can have multiple Ticket types
- Users can make multiple Bookings
- Bookings contain multiple Tickets
- Payments are linked to Bookings

## 🔐 Security Features

### Authentication & Authorization

- JWT-based authentication with refresh tokens
- Role-based access control (User, Organizer, Admin)
- Password hashing with bcrypt
- OAuth integration (Google)

### Data Protection

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting
- Helmet.js security headers

### Payment Security

- PCI DSS compliant payment processing
- Webhook signature verification
- Encrypted QR codes for tickets
- Secure session management

## 📊 API Documentation

### Interactive Documentation

- **Swagger UI**: `http://localhost:5000/docs`
- **ReDoc**: `http://localhost:5000/api-docs`
- **OpenAPI Spec**: `http://localhost:5000/swagger.json`

### Key Endpoints

- **Authentication**: `/auth/*`
- **Users**: `/user/*`
- **Events**: `/api/events/*`
- **Tickets**: `/api/tickets/*`
- **Bookings**: `/api/booking/*`
- **Payments**: `/api/payment/*`
- **Analytics**: `/api/analytics/*`

## 🚀 Deployment

### Production URLs

- **Frontend**: `https://tazkarti.vercel.app`
- **Backend**: `https://tazkaritbackend.fly.dev`
- **Dashboard**: `https://tazkarti-dashboard.vercel.app`

### Deployment Platforms

- **Frontend**: Vercel
- **Backend**: Fly.io
- **Dashboard**: Vercel
- **Database**: MongoDB Atlas

### CI/CD Pipeline

- Automatic deployment on push to main branch
- Environment-specific configurations
- Automated testing and builds
- Health checks and monitoring

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load and stress testing

### Running Tests

```bash
# Backend tests
cd Backend && npm test

# Frontend tests
cd frontend && npm test

# Dashboard tests
cd Dashboard && npm test
```

## 📈 Performance & Monitoring

### Performance Features

- Redis caching for sessions
- Image optimization with Cloudinary
- Database indexing and query optimization
- CDN for static assets
- Compression middleware

### Monitoring

- Winston logging system
- Error tracking and reporting
- Performance metrics
- Health check endpoints
- Automated cleanup jobs

## 🌍 Internationalization

### Supported Languages

- **Arabic** (العربية) - RTL support
- **English** - LTR support

### Implementation

- Frontend: React i18next
- Backend: Localized error messages
- Dashboard: Angular i18n

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with descriptive messages
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Standards

- Follow ESLint configurations
- Use Prettier for code formatting
- Write comprehensive tests
- Document new features
- Follow conventional commit messages

## 📋 Project Structure

```
tazkarti/
├── 📁 Backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # Database schemas
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business services
│   │   ├── utils/             # Helper functions
│   │   └── swagger/           # API documentation
│   ├── package.json
│   └── README.md
├── 📁 frontend/               # React user interface
│   ├── src/
│   │   ├── Components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── contexts/          # React contexts
│   │   └── locales/           # Translations
│   ├── package.json
│   └── README.md
├── 📁 Dashboard/              # Angular admin panel
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # Angular components
│   │   │   ├── core/          # Core services
│   │   │   └── layouts/       # Layout components
│   │   └── assets/            # Static assets
│   ├── package.json
│   └── README.md
├── 📄 README.md               # This file
├── 📄 project_endpoints.txt   # API documentation
└── 📄 ORGANIZER_API_TESTING.md # Testing guide
```

## 🆘 Support & Documentation

### Getting Help

- **Documentation**: Check individual README files
- **API Docs**: Visit `/docs` endpoint
- **Issues**: Create GitHub issues
- **Discussions**: Use GitHub Discussions

### Team Members

- **Mostafa Ramadan** - [@mostafa-R](https://github.com/mostafa-R)
- **Zyad Saeed** - [@ZyadSaeed22](https://github.com/ZyadSaeed22)
- **Mostafa Sayed** - [@mostafasayed0](https://github.com/mostafasayed0)
- **Mariam Mahmoud** - [@MariamHammouda](https://github.com/MariamHammouda)

### Contact

- **Website**: https://tazkarti.vercel.app/
- **GitHub**: https://github.com/mostafa-R/tazkarti

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Tazkarti Team**

_Empowering event organizers and delighting attendees worldwide_ 🌍
