export interface Coordinates {
  lat: number;
  lng: number;
}

export interface EventLocation {
  address: string;
  city: string;
  venue: string;
  coordinates?: Coordinates;
}

export interface Organizer {
  _id: string;
  email: string;
}

export interface AppEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  time: string;
  organizer?: Organizer;
  images: string[];
  trailerVideo?: string | null;
  status: string;
  approved: boolean;
  upcoming: boolean;
  maxAttendees: number;
  currentAttendees: number;
  tags: string[];
  tickets: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isSoldOut: boolean;
  availableSpots: number;
  id: string;
  location: EventLocation;
}
