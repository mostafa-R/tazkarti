# 📊 Tazkarti Dashboard

A comprehensive Angular-based admin dashboard for the Tazkarti event management platform. Built with Angular 17, Bootstrap 5, and modern web technologies, providing powerful management tools for administrators and event organizers.

## 🌟 Features

### 🎯 Core Functionality
- **Admin Dashboard** with comprehensive analytics
- **Event Management** and approval system
- **User Management** with role-based access
- **Ticket Management** and oversight
- **Booking Management** and monitoring
- **Revenue Tracking** and financial reports
- **Real-time Analytics** with interactive charts
- **Multi-language Support** (Arabic/English)

### 👨‍💼 Admin Features
- **System Overview** with key metrics
- **User Management** - View, edit, and manage users
- **Event Approval** - Review and approve events
- **Analytics Dashboard** - Comprehensive platform insights
- **Revenue Reports** - Financial tracking and reporting
- **System Settings** - Platform configuration
- **Audit Logs** - Track system activities

### 🎪 Organizer Features
- **Event Dashboard** - Manage your events
- **Ticket Management** - Create and manage ticket types
- **Booking Overview** - View and manage bookings
- **Revenue Analytics** - Track your earnings
- **Event Analytics** - Performance metrics
- **Attendee Management** - Manage event attendees

## 🚀 Tech Stack

### Frontend Framework
- **Angular 17** - Latest Angular with standalone components
- **Angular SSR** - Server-side rendering support
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming

### UI/UX Libraries
- **Bootstrap 5** - Responsive CSS framework
- **Font Awesome** - Icon library
- **ngx-charts** - Chart.js integration
- **ngx-toastr** - Toast notifications
- **ngx-translate** - Internationalization

## 📁 Project Structure

```
Dashboard/
├── src/
│   ├── app/
│   │   ├── components/        # Angular components
│   │   │   ├── dashboard/     # Dashboard component
│   │   │   ├── events/        # Events management
│   │   │   ├── login/         # Login component
│   │   │   ├── navbar/        # Navigation bar
│   │   │   ├── sidebar/       # Sidebar navigation
│   │   │   ├── tickets/       # Tickets management
│   │   │   ├── users/         # Users management
│   │   │   └── waiting-events/ # Pending events
│   │   ├── core/              # Core functionality
│   │   │   ├── guards/        # Route guards
│   │   │   ├── interfaces/    # TypeScript interfaces
│   │   │   └── services/      # Angular services
│   │   ├── layouts/           # Layout components
│   │   └── environment/       # Environment configuration
│   ├── assets/                # Static assets
│   └── locales/               # Translation files
├── package.json
├── angular.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Angular CLI** (v17 or higher)

### Installation

1. **Clone and navigate to Dashboard**
   ```bash
   git clone https://github.com/your-username/tazkarti.git
   cd tazkarti/Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open in browser**
   Navigate to `http://localhost:4200`

## 🚀 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `ng serve` | Start development server |
| `ng build` | Build the project |
| `ng test` | Run unit tests |

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `http://localhost:5000` |
| `DASHBOARD_URL` | Dashboard URL | `http://localhost:4200` |

## 🎨 UI/UX Features

### Design System
- **Responsive Design** - Mobile-first approach
- **Bootstrap 5** - Modern CSS framework
- **Font Awesome Icons** - Comprehensive icon library
- **Custom Components** - Reusable UI components

### Component Library
- **Dashboard Component** - Main analytics dashboard
- **Event Management** - Event CRUD operations
- **User Management** - User administration
- **Ticket Management** - Ticket oversight
- **Navigation Components** - Navbar and sidebar
- **Chart Components** - Data visualization

## 🔐 Authentication & Security

### Authentication Flow
1. **Login Page** - Admin/organizer authentication
2. **Route Guards** - Protected routes
3. **Role-based Access** - Different views for different roles
4. **Session Management** - Secure session handling

### Security Features
- **JWT Authentication** - Token-based auth
- **Route Protection** - Guarded routes
- **Role-based UI** - Different interfaces per role
- **Input Validation** - Form validation

## 📊 Analytics & Reporting

### Dashboard Analytics
- **Revenue Metrics** - Financial overview
- **Event Statistics** - Event performance
- **User Analytics** - User engagement
- **Booking Trends** - Booking patterns
- **Real-time Updates** - Live data refresh

### Chart Types
- **Line Charts** - Trend analysis
- **Bar Charts** - Comparative data
- **Pie Charts** - Distribution data
- **Area Charts** - Cumulative data

## 🌍 Internationalization

### Supported Languages
- **Arabic** (العربية) - RTL support
- **English** - LTR support

### Implementation
- **ngx-translate** - Translation service
- **Language Detection** - Automatic detection
- **RTL Support** - Right-to-left layout

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Build with SSR
npm run build:ssr
```

### Deployment Platforms
- **Vercel** - Recommended for Angular apps
- **Netlify** - Alternative deployment option
- **Firebase Hosting** - Google's hosting platform

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with descriptive messages
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

## 🆘 Support

### Getting Help
- **Angular Documentation**: https://angular.io/docs
- **Issues**: Create GitHub issues
- **Email**: support@tazkarti.com

### Team Members
- **Mostafa Ramadan** - [@mostafa-R](https://github.com/mostafa-R)
- **Zyad Saeed** - [@ZyadSaeed22](https://github.com/ZyadSaeed22)
- **Mostafa Sayed** - [@mostafasayed0](https://github.com/mostafasayed0)
- **Mariam Mahmoud** - [@MariamHammouda](https://github.com/MariamHammouda)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Angular 17 and modern web technologies**

*Powering the Tazkarti admin experience* 📊
