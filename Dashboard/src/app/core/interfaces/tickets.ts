export interface Tickets {
  id: number;
  eventId: string;
  userId: number;
  status: string;
  reservedTickets:number;
  purchaseDate?: string;
  price?: number;
}

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

export interface EventTicketStats {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventLocation: EventLocation; // ✅ بدل ما كانت string
  totalTickets: number;
  reservedTickets: number;
  availableTickets: number;
  reservedPercentage: number;
  availablePercentage: number;
}
