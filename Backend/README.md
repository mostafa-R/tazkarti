# 🎫 تذكرتي - Event Management Backend

A modern, secure, and scalable Node.js + Express.js backend for event management platform.

## ✨ Features

### 🔐 Security & Authentication

- JWT-based authentication with refresh tokens
- Role-based access control (user, organizer, admin)
- Secure payment processing with webhook verification
- Password hashing with bcrypt
- Email verification using Nodemailer

### 🎟️ Event & Ticket Management

- Event creation and management
- Dynamic ticket types and pricing
- QR code generation for tickets with encryption
- Secure ticket verification system
- Real-time inventory management

### 💳 Payment System

- Secure payment integration (Checkout.com)
- Webhook-based payment confirmation
- Payment status tracking
- Automatic refund handling
- Transaction audit trail

### 📊 Management & Analytics

- Organizer dashboard with statistics
- Booking management system
- Event analytics and reporting
- Automated cleanup of expired bookings

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 5+
- Redis (optional, for sessions)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/tazkarti

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Email Service
EMAIL_FROM=noreply@tazkarti.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateway (Checkout.com)
CKO_SECRET_KEY=sk_your-secret-key
CKO_WEBHOOK_SECRET=whsec_your-webhook-secret
CKO_ENV=sandbox

# QR Code & Encryption
QR_CODE_SECRET=your-qr-secret-key
ENCRYPTION_KEY=your-32-char-encryption-key

# App Settings
APP_BASE_URL=http://localhost:5000
PORT=5000
```

## 📁 Project Structure

```
src/
├── 📂 config/              # Configuration files
├── 📂 controllers/         # Business logic (7 controllers)
├── 📂 middleware/          # Custom middleware
├── 📂 models/             # Database schemas (7 models)
├── 📂 routes/             # API endpoints (6 route files)
├── 📂 services/           # Business services (2 services)
├── 📂 utils/              # Helper functions (6 utilities)
├── 📂 validators/         # Data validation
└── 📄 server.js           # Application entry point
```

## 🛠 Development Scripts

```bash
npm run dev          # Start with nodemon
npm start           # Production start
npm run format      # Format code with Prettier
npm run format:check # Check code formatting
npm run clean       # Clean install dependencies
```

## 🔧 Code Quality

- **Prettier** for consistent code formatting
- **EditorConfig** for unified editor settings
- **Clean architecture** with separated concerns
- **No duplicate code** or unused files
- **Comprehensive error handling**

## 📚 Documentation


- API documentation available in controllers

## 🤝 Team Members

● **Mostafa Ramadan** - https://github.com/mostafa-R  
● **Zyad Saeed** - https://github.com/ZyadSaeed22  
● **Mostafa Sayed** - https://github.com/mostafasayed0  
● **Mariam Mahmoud** - https://github.com/MariamHammouda

---

**Built with ❤️ using modern Node.js practices**
