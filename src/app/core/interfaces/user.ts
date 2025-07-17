import { Tickets } from "./tickets";

export interface User {
  id: string;
  name: string;
  email: string;
  tickets: Tickets[];
  createdAt: number;
  date: number;
  role: 'user' | 'organizer';
}

