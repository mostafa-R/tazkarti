import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { environment } from '../../environment/environment';
import { AppEvent } from '../interfaces/event';
import { User } from '../interfaces/user';
import { Tickets, EventTicketStats } from '../interfaces/tickets';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  // BehaviorSubject لتخزين الأحداث المعتمدة حديثًا
  private approvedEventsSubject = new BehaviorSubject<AppEvent[]>([]);
  public approvedEvents$ = new BehaviorSubject<AppEvent[]>([]);

  constructor(private _HttpClient: HttpClient) {}

  getusers(): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.get(`${environment.BASE_URL}/user/allusers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  login(adminData: object): Observable<any> {
    return this._HttpClient.post(
      `${environment.BASE_URL}/auth/login`,
      adminData
    );
  }

  saveUserData(): void {
    if (localStorage.getItem('userToken') !== null) {
      jwtDecode(localStorage.getItem('userToken')!);
    }
  }

  getevents(): Observable<AppEvent[]> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient
      .get<{ events: AppEvent[] }>(`${environment.BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(map((res) => res.events || []));
  }

  searchEvents(query: string): Observable<AppEvent[]> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient
      .get<{ events: AppEvent[] }>(
        `${environment.BASE_URL}/api/events/search?q=${encodeURIComponent(
          query
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(map((res) => res.events || []));
  }

  getEventsWithPagination(
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.get<any>(
      `${environment.BASE_URL}/api/events?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  getTickets(): Observable<Tickets[]> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.get<Tickets[]>(
      `${environment.BASE_URL}/api/tickets`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  getnotfigation(): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.get(`${environment.BASE_URL}/user/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  geteventById(id: string): Observable<AppEvent> {
    return this._HttpClient.get<AppEvent>(
      `${environment.BASE_URL}/api/events/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      }
    );
  }

  updateEvent(event: Partial<AppEvent>, id: string): Observable<AppEvent> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.patch<AppEvent>(
      `${environment.BASE_URL}/api/events/edit/${id}`,
      event,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  deleteEvent(id: string): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.delete(`${environment.BASE_URL}/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  createEvent(event: Partial<AppEvent>): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.post(`${environment.BASE_URL}/api/events`, event, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getEventsByCategory(category: string): Observable<AppEvent[]> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient
      .get<{ events: AppEvent[] }>(
        `${environment.BASE_URL}/api/events?category=${category}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(map((res) => res.events || []));
  }

  getUpcomingEvents(): Observable<AppEvent[]> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient
      .get<{ events: AppEvent[] }>(
        `${environment.BASE_URL}/api/events?upcoming=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .pipe(map((res) => res.events || []));
  }

  updateEventStatus(eventId: string, status: string): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.patch(
      `${environment.BASE_URL}/api/events/${eventId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  uploadEventImage(eventId: string, imageFile: File): Observable<any> {
    const token = localStorage.getItem('userToken');
    const formData = new FormData();
    formData.append('image', imageFile);

    return this._HttpClient.post(
      `${environment.BASE_URL}/api/events/${eventId}/images`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }

  deleteEventImage(eventId: string, imageUrl: string): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.delete(
      `${environment.BASE_URL}/api/events/${eventId}/images`,
      {
        headers: { Authorization: `Bearer ${token}` },
        body: { imageUrl },
      }
    );
  }

  approveEvent(eventId: string, approved: boolean): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this._HttpClient.post(
      `${environment.BASE_URL}/user/approveEvent`,
      { id: eventId, approved }, // هنا id لازم يطابق eventId
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  getEventTicketStats(): Observable<EventTicketStats[]> {
    return new Observable((observer) => {
      this.getevents().subscribe((events) => {
        this.getTickets().subscribe((tickets) => {
          this.getusers().subscribe((users) => {
            const stats = this.calculateTicketStats(events, tickets, users);
            observer.next(stats);
            observer.complete();
          });
        });
      });
    });
  }

  getEventStatistics(): Observable<any> {
    return new Observable((observer) => {
      this.getevents().subscribe((events) => {
        const stats = {
          totalEvents: events.length,
          upcomingEvents: events.filter((e) => e.upcoming).length,
          publishedEvents: events.filter((e) => e.status === 'published')
            .length,
          approvedEvents: events.filter((e) => e.approved).length,
          totalAttendees: events.reduce(
            (sum, e) => sum + e.currentAttendees,
            0
          ),
          totalCapacity: events.reduce((sum, e) => sum + e.maxAttendees, 0),
          categories: [...new Set(events.map((e) => e.category))],
          averageAttendance:
            events.length > 0
              ? Math.round(
                  events.reduce((sum, e) => sum + e.currentAttendees, 0) /
                    events.length
                )
              : 0,
        };
        observer.next(stats);
        observer.complete();
      });
    });
  }

  private calculateTicketStats(
    events: AppEvent[],
    tickets: Tickets[],
    users: User[]
  ): EventTicketStats[] {
    return events.map((event) => {
      const eventTickets = tickets.filter(
        (ticket) => String(ticket.eventId) === String(event._id)
      );
      const confirmedTickets = eventTickets.filter(
        (ticket) => ticket.status === 'confirmed'
      ).length;
      const pendingTickets = eventTickets.filter(
        (ticket) => ticket.status === 'pending'
      ).length;

      const reservedTickets = confirmedTickets + pendingTickets;
      const availableTickets = event.maxAttendees - reservedTickets;

      const reservedPercentage =
        event.maxAttendees > 0
          ? Math.round((reservedTickets / event.maxAttendees) * 100)
          : 0;
      const availablePercentage = 100 - reservedPercentage;

      return {
        eventId: event._id,
        eventName: event.title,
        eventDate: event.startDate,
        eventLocation: event.location,
        totalTickets: event.maxAttendees,
        reservedTickets: reservedTickets,
        availableTickets: Math.max(0, availableTickets),
        reservedPercentage: reservedPercentage,
        availablePercentage: availablePercentage,
      };
    });
  }
}
