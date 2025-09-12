import { Tickets } from "./tickets";

export interface User {
  _id: string;
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  userName?: string;
  username?: string;
  email: string;
  profileImage?: string;
  phone?: string;
  bio?: string;
  role: 'user' | 'organizer';
  ticketsBooked: Tickets[];
  googleId?: string | null;
  organizationName?: string;
  organizationDescription?: string;
  notifications?: any[];
  address?: {
    country: string;
    city: string;
    street: string;
    zip: string;
  };
  createdAt: string;
  updatedAt: string;
  date?: number;
}

