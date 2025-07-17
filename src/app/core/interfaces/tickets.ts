export interface Tickets {
  id: number;
  eventId: number;
  userId: number;
  status: string;
  purchaseDate?: string;
  price?: number;
}

export interface EventTicketStats {
  eventId: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  totalTickets: number;
  reservedTickets: number;
  availableTickets: number;
  reservedPercentage: number;
  availablePercentage: number;
}
