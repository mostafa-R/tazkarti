# 🎫 Tazkarti Frontend

A modern, responsive React-based frontend for the Tazkarti event ticketing platform. Built with React 19, Vite, and Tailwind CSS, featuring a comprehensive event management system with multi-role support.

## 🌟 Features

### 🎯 Core Functionality

- **Event Discovery**: Browse and search events with advanced filtering
- **Ticket Management**: Purchase, view, and manage tickets with QR code verification
- **Multi-Role Support**: Separate interfaces for users, organizers, and admins
- **Secure Authentication**: JWT-based auth with role-based access control
- **Payment Integration**: Secure payment processing with Checkout.com
- **Real-time Chat**: AI-powered chatbot for customer support
- **Internationalization**: Multi-language support (Arabic/English)

### 👥 User Features

- **Event Browsing**: Discover events with detailed information
- **Ticket Purchase**: Secure booking and payment process
- **Profile Management**: Personal dashboard and settings
- **Booking History**: View past and upcoming bookings
- **QR Code Tickets**: Digital tickets with QR verification

### 🎪 Organizer Features

- **Event Creation**: Comprehensive event setup and management
- **Dashboard Analytics**: Real-time insights and statistics
- **Ticket Management**: Create and manage different ticket types
- **Booking Management**: Handle reservations and attendee data
- **Revenue Tracking**: Monitor sales and financial performance

### 🔧 Admin Features

- **User Management**: Oversee user accounts and roles
- **Event Moderation**: Approve and manage all events
- **System Analytics**: Platform-wide insights and reporting
- **Content Management**: Manage platform content and settings

## 🚀 Tech Stack

### Frontend Framework

- **React 19** - Latest React with concurrent features
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework

### State Management & Context

- **React Context API** - Global state management
- **Custom Hooks** - Reusable stateful logic
- **Local Storage** - Persistent user data

### UI/UX Libraries

- **Lucide React** - Beautiful icon library
- **React Toastify** - Notification system
- **React i18next** - Internationalization

### API & Services

- **Axios** - HTTP client for API communication
- **Custom API Service** - Centralized API management
- **JWT Authentication** - Secure token-based auth

## 📁 Project Structure

```
frontend/
├── public/
│   ├── _redirects          # Vercel routing configuration
│   └── vite.svg
├── src/
│   ├── Components/         # Reusable UI components
│   │   ├── common/         # Shared components
│   │   ├── ChatWidget.jsx  # AI chatbot
│   │   ├── EventCard.jsx   # Event display component
│   │   ├── Navbar.jsx      # Navigation bar
│   │   └── ...
│   ├── contexts/           # React Context providers
│   │   └── AuthContext.jsx # Authentication context
│   ├── hooks/              # Custom React hooks
│   ├── locales/            # Internationalization files
│   │   ├── ar/             # Arabic translations
│   │   └── en/             # English translations
│   ├── pages/              # Page components
│   │   ├── Home.jsx        # Landing page
│   │   ├── Event.jsx       # Events listing
│   │   ├── EventDetails.jsx # Event details
│   │   ├── Booking.jsx     # Ticket booking
│   │   ├── Payment.jsx     # Payment processing
│   │   ├── OrganizerDashboard.jsx # Organizer panel
│   │   └── ...
│   ├── services/           # API services
│   │   ├── api.js          # Main API client
│   │   ├── eventService.js # Event-related APIs
│   │   └── organizerAPI.js # Organizer APIs
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
├── vercel.json             # Vercel deployment config
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/mostafa-R/tazkarti.git
   cd tazkarti/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:5000
   VITE_FRONTEND_URL=http://localhost:5173
   ```

4. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🚀 Available Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build production-ready application       |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint for code quality checks       |

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# The dist folder contains the production build
# Upload contents to your hosting provider
```

## 🔧 Configuration

### Environment Variables

| Variable            | Description     | Default                 |
| ------------------- | --------------- | ----------------------- |
| `VITE_API_URL`      | Backend API URL | `http://localhost:5000` |
| `VITE_FRONTEND_URL` | Frontend URL    | `http://localhost:5173` |

### Vite Configuration

The application uses Vite with the following features:

- React plugin for JSX support
- Proxy configuration for API calls
- Source maps for debugging
- Optimized production builds

## 🎨 UI/UX Features

### Design System

- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark/Light Theme**: Automatic theme detection
- **Accessibility**: WCAG compliant components
- **Animations**: Smooth transitions and micro-interactions

### Component Library

- **FormInput**: Reusable form input component
- **EventCard**: Event display with image, details, and actions
- **ProtectedRoute**: Route protection based on authentication
- **ChatWidget**: AI-powered customer support

## 🔐 Authentication & Security

### Authentication Flow

1. **Registration**: Multi-step form with validation
2. **Login**: Email/password with JWT tokens
3. **OAuth**: Google OAuth integration
4. **Role Management**: User, Organizer, Admin roles

### Security Features

- **JWT Tokens**: Secure authentication
- **Route Protection**: Role-based access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs

## 🌍 Internationalization

### Supported Languages

- **Arabic** (العربية) - RTL support
- **English** - LTR support

### Adding New Languages

1. Create new locale file in `src/locales/[lang]/translation.json`
2. Add language detection in `src/i18n.js`
3. Update language selector component

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Features

- Touch-friendly interface
- Swipe gestures for navigation
- Optimized forms for mobile input
- Progressive Web App capabilities

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user journey testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify environment variables

**API Connection Issues**

- Verify `VITE_API_URL` environment variable
- Check CORS configuration in backend
- Ensure backend server is running

**Routing Issues**

- Clear browser cache
- Check `vercel.json` configuration
- Verify route definitions in `App.jsx`

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards

- Follow ESLint configuration
- Use meaningful commit messages
- Write descriptive component names
- Add comments for complex logic


## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions

### Contact

- **Email**: support@tazkarti.com
- **Website**: https://tazkarti.vercel.app/
- **GitHub**: https://github.com/mostafa-R/tazkarti

---

**Built with ❤️ by the Tazkarti Team**
