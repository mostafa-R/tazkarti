import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';
import { forkJoin, catchError, of } from 'rxjs';
import { User } from '../../core/interfaces/user';
import { Tickets } from '../../core/interfaces/tickets';
import { AppEvent } from '../../core/interfaces/event';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule ,RouterLink , TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  chartData = signal<{ name: string; value: number }[]>([]);
  latestEvents = signal<AppEvent[]>([]);
  usersLineChartData = signal<any[]>([]);

  usersCount = signal<number>(0);
  eventsCount = signal<number>(0);
  ticketsCount = signal<number>(0);

  curve = shape.curveBasis;
  currentDate = new Date();

  // Loading states
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.spinner.show();

    const token = localStorage.getItem('userToken');
    if (!token) {
      console.error('No authentication token found');
      this.hasError.set(true);
      this.isLoading.set(false);
      this.spinner.hide();
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    const users$ = this.http.get<User[]>('http://localhost:5000/user/allusers', { headers })
      .pipe(catchError(error => {
        console.error('Error loading users:', error);
        return of([]);
      }));

    const tickets$ = this.http.get<Tickets[]>('http://localhost:5000/api/tickets', { headers })
      .pipe(catchError(error => {
        console.error('Error loading tickets:', error);
        return of([]);
      }));

    const events$ = this.http
      .get<{ events: AppEvent[] }>('http://localhost:5000/api/events', {
        headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error loading events:', error);
          return of({ events: [] });
        })
      );


    forkJoin([users$, tickets$, events$]).subscribe({
      next: ([users, tickets, eventsResponse]) => {
        console.log('Dashboard data loaded:', {
          users,
          tickets,
          eventsResponse,
        });
        const events = eventsResponse?.events || [];

        // Set chart data
        this.chartData.set([
          { name: 'Users', value: users?.length || 0 },
          {
            name: 'Tickets (Reserved)',
            value: tickets.filter((ticket) => ticket.status === 'reserved')
              .length,
          },
          { name: 'Events', value: events?.length || 0 },
        ]);

        // Set users line chart data
        if (users && users.length > 0) {
          this.usersLineChartData.set([
            {
              name: 'Users',
              series: this.getUsersPerMonth(users),
            },
          ]);
        }

        // Set counts
        this.usersCount.set(users?.length || 0);
        this.eventsCount.set(events?.length || 0);
        this.ticketsCount.set(
          tickets.filter((ticket) => ticket.status === 'reserved').length
        );

        // Set latest events with better error handling
        if (events && Array.isArray(events) && events.length > 0) {
          console.log('Processing events:', events);

          const sortedEvents = events
            .filter((event) => {
              if (!event) {
                console.warn('Event is null or undefined');
                return false;
              }
              if (!event.title && !event.title) {
                console.warn('Event missing title or name:', event);
                return false;
              }
              return true;
            })
            .sort((a, b) => {
              try {
                const dateA = a.startDate ? new Date(a.startDate) : new Date(0);
                const dateB = b.startDate ? new Date(b.startDate) : new Date(0);
                return dateB.getTime() - dateA.getTime();
              } catch (error) {
                console.error('Error sorting events:', error);
                return 0;
              }
            })
            .slice(0, 5);

          console.log('Sorted events:', sortedEvents);
          this.latestEvents.set(sortedEvents);
        } else {
          console.log('No events found or events is not an array:', events);
          this.latestEvents.set([]);
        }

        this.isLoading.set(false);
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.hasError.set(true);
        this.isLoading.set(false);
        this.spinner.hide();
      },
    });

  }

  getUsersPerMonth(users: User[]): { name: string; value: number }[] {
    if (!users || users.length === 0) {
      return [];
    }

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const count: { [key: string]: number } = {};

    users.forEach((user) => {
      try {
        // Handle different date formats
        let date: Date;
        if (user.createdAt) {
          // If createdAt is a number (timestamp), convert it
          if (typeof user.createdAt === 'number') {
            date = new Date(user.createdAt);
          } else {
            date = new Date(user.createdAt);
          }
        } else if (user.date) {
          // Fallback to date field
          if (typeof user.date === 'number') {
            date = new Date(user.date);
          } else {
            date = new Date(user.date);
          }
        } else {
          // If no date, use current date
          date = new Date();
        }

        // Check if date is valid
        if (!isNaN(date.getTime())) {
          const month = months[date.getMonth()];
          count[month] = (count[month] || 0) + 1;
        }
      } catch (error) {
        console.error('Error processing user date:', error, user);
      }
    });

    return months.map((month) => ({ name: month, value: count[month] || 0 }));
  }



  // Get new users this month
  newUsersThisMonth(): number {
    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const totalUsers = this.usersCount();

      // Mock calculation - you would get this from your backend
      return Math.floor(totalUsers * 0.15); // 15% of total users as new this month
    } catch (error) {
      console.error('Error calculating new users:', error);
      return 0;
    }
  }

  // Get upcoming events count
  upcomingEvents(): number {
    try {
      const events = this.latestEvents();
      if (!events || events.length === 0) return 0;

      const now = new Date();
      return events.filter(event => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        return !isNaN(eventDate.getTime()) && eventDate > now;
      }).length;
    } catch (error) {
      console.error('Error calculating upcoming events:', error);
      return 0;
    }
  }

  // Get average event rating
  averageRating(): number {
    // Mock calculation - you would get this from your backend
    return 4.2;
  }

  // Get event status based on date
  getEventStatus(date: string): string {
    try {
      if (!date) return 'upcoming';

      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) return 'upcoming';

      const now = new Date();
      const diffTime = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'past';
      } else if (diffDays <= 7) {
        return 'ongoing';
      } else {
        return 'upcoming';
      }
    } catch (error) {
      console.error('Error calculating event status:', error);
      return 'upcoming';
    }
  }

  // Get event status text
  getEventStatusText(date: string): string {
    try {
      if (!date) return 'Upcoming';

      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) return 'Upcoming';

      const now = new Date();
      const diffTime = eventDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return 'Past';
      } else if (diffDays <= 7) {
        return 'Soon';
      } else {
        return 'Upcoming';
      }
    } catch (error) {
      console.error('Error calculating event status text:', error);
      return 'Upcoming';
    }
  }
}
