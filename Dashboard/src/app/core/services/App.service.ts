import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { AppEvent } from '../interfaces/event';
import { User } from '../interfaces/user';
import { Tickets, EventTicketStats } from '../interfaces/tickets';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private _HttpClient: HttpClient) {}
  Tokin:boolean=false
  getusers(): Observable<any> {
    return this._HttpClient.get(`${environment.BASE_URL}/users`);
  }

  getevents(): Observable<any> {
    return this._HttpClient.get(`${environment.BASE_URL}/events`);
  }

  getTickets(): Observable<any> {
    return this._HttpClient.get(`${environment.BASE_URL}/tickets`);
  }

  geteventById(id: string): Observable<any> {
    return this._HttpClient.get(`${environment.BASE_URL}/events/${id}`);
  }

  updateEvent(event: AppEvent, id: string): Observable<any> {
    return this._HttpClient.patch(
      `${environment.BASE_URL}/events/${id}`,
      event
    );
  }

  deletEvent(id: string): Observable<any> {
    return this._HttpClient.delete(`${environment.BASE_URL}/events/${id}`);
  }

  // New methods for tickets page
  getEventTicketStats(): Observable<EventTicketStats[]> {
    return new Observable(observer => {
      // Get all data
      this.getevents().subscribe(events => {
        this.getTickets().subscribe(tickets => {
          this.getusers().subscribe(users => {
            const stats = this.calculateTicketStats(events, tickets, users);
            observer.next(stats);
            observer.complete();
          });
        });
      });
    });
  }

  private calculateTicketStats(events: AppEvent[], tickets: Tickets[], users: User[]): EventTicketStats[] {
    return events.map(event => {
      // Count tickets for this event
      const eventTickets = tickets.filter(ticket => ticket.eventId === parseInt(event.id));
      const confirmedTickets = eventTickets.filter(ticket => ticket.status === 'confirmed').length;
      const pendingTickets = eventTickets.filter(ticket => ticket.status === 'pending').length;
      const reservedTickets = confirmedTickets + pendingTickets;
      const availableTickets = event.tickets - reservedTickets;

      const reservedPercentage = event.tickets > 0 ? Math.round((reservedTickets / event.tickets) * 100) : 0;
      const availablePercentage = 100 - reservedPercentage;

      return {
        eventId: parseInt(event.id),
        eventName: event.name,
        eventDate: event.date,
        eventLocation: event.location,
        totalTickets: event.tickets,
        reservedTickets: reservedTickets,
        availableTickets: Math.max(0, availableTickets), // Ensure non-negative
        reservedPercentage: reservedPercentage,
        availablePercentage: availablePercentage
      };
    });
  }
}
