import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';
import { forkJoin } from 'rxjs';
import { User } from '../../core/interfaces/user';
import { Tickets } from '../../core/interfaces/tickets';
import { AppEvent } from '../../core/interfaces/event';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule ,RouterLink],
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


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const users$ = this.http.get<User[]>('http://localhost:3000/users');
    const tickets$ = this.http.get<Tickets[]>('http://localhost:3000/tickets');
    const events$ = this.http.get<AppEvent[]>('http://localhost:3000/events');

    forkJoin([users$, tickets$, events$]).subscribe({
      next: ([users, tickets, events]) => {
        this.chartData.set([
          { name: 'Users', value: users.length },
          { name: 'Tickets', value: tickets.length },
          { name: 'Events', value: events.length },
        ]);

        this.usersLineChartData.set([
          {
            name: 'Users',
            series: this.getUsersPerMonth(users),
          },
        ]);

        this.usersCount.set(users.length);
        this.eventsCount.set(events.length);
        this.ticketsCount.set(tickets.length);

        this.latestEvents.set(
          events
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 5)
        );
      },
      error: (err) => console.error('Error loading data:', err),
    });
  }

  getUsersPerMonth(users: User[]): { name: string; value: number }[] {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const count: { [key: string]: number } = {};

    users.forEach((user) => {
      const date = new Date(user.createdAt || new Date());
      const month = months[date.getMonth()];
      count[month] = (count[month] || 0) + 1;
    });

    return months.map((month) => ({ name: month, value: count[month] || 0 }));
  }



  // Get new users this month
  newUsersThisMonth(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Mock calculation - you would get this from your backend
    const totalUsers = this.usersCount();
    return Math.floor(totalUsers * 0.15); // 15% of total users as new this month
  }

  // Get upcoming events count
  upcomingEvents(): number {
    const events = this.latestEvents();
    const now = new Date();

    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate > now;
    }).length;
  }

  // Get average event rating
  averageRating(): number {
    // Mock calculation - you would get this from your backend
    return 4.2;
  }

  // Get event status based on date
  getEventStatus(date: string): string {
    const eventDate = new Date(date);
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
  }

  // Get event status text
  getEventStatusText(date: string): string {
    const eventDate = new Date(date);
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
  }
}
