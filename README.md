# Event Management Backend

A Node.js + Express.js backend for an event management system similar to Tazkarti.

## Setup

1. Install dependencies: `npm install`
2. Create a `.env` file with the required environment variables .
3. Start the server: `npm start` or `npm run dev` for development.

## Features

- User registration and authentication with JWT.
- Event creation and management.
- Ticket purchasing with QR code generation.
- Role-based access control (user, organizer, admin).
- Email verification using Nodemailer.
- Password hashing with bcrypt.

## Directory Structure

- `src/config`: Configuration files for database and email.
- `src/models`: MongoDB schemas.
- `src/controllers`: Business logic for API endpoints.
- `src/middleware`: Custom middleware for authentication and error handling.
- `src/routes`: API route definitions.
- `src/services`: Reusable services (email, QR code, payment).
- `src/utils`: Utility functions.

# Team Members

● Mostafa Ramadan : https://github.com/mostafa-R                                                                                                
● Zyad Saeed      : https://github.com/ZyadSaeed22                                                                                             
● Mostafa Sayed   : https://github.com/mostafasayed0                                                                                            
● Mariam Mahmoud  : https://github.com/MariamHammouda                                                                                           
