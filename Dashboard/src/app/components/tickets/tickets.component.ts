import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventTicketStats } from '../../core/interfaces/tickets';
import { AppService } from '../../core/services/App.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule ,TranslateModule , DatePipe],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent implements OnInit {

  events: EventTicketStats[] = [];
  filteredEvents: EventTicketStats[] = [];
  searchTerm: string = '';
  loading: boolean = true;

  // Stats
  totalEvents: number = 0;
  totalTickets: number |any = 0;
  totalReserved: number = 0;
  totalAvailable: number = 0;

  constructor(private appService: AppService ,private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.loadEventsData();
    this.spinner.show();

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  loadEventsData() {
    this.loading = true;
    this.appService.getEventTicketStats().subscribe({
      next: (data) => {
        console.log('Ticket data loaded:', data);
        this.events = data;
        this.filteredEvents = [...this.events];
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ticket data:', error);
        this.loading = false;
        // Fallback to empty data
        this.events = [];
        this.filteredEvents = [];
        this.calculateStats();
      }
    });
  }

  calculateStats() {
    this.totalEvents = this.events.length;
    this.totalReserved = this.events.reduce((sum, event) => sum + event.reservedTickets, 0);
    this.totalAvailable = this.events.reduce((sum, event) => sum + event.availableTickets, 0);
  }

  onSearch() {
    this.filterEvents();
  }

  filterEvents() {
    let filtered = this.events.filter(event =>
      event.eventName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.filteredEvents = filtered;
  }

  getStatusClass(event: EventTicketStats): string {
    if (event.availableTickets === 0) return 'sold-out';
    if (event.reservedTickets >= 80) return 'high-demand';
    if (event.reservedTickets <= 30) return 'low-demand';
    return 'normal';
  }

  getStatusText(event: EventTicketStats): string {
    if (event.availableTickets === 0) return 'Sold Out';
    if (event.reservedTickets >= 80) return 'High Demand';
    if (event.reservedTickets <= 30) return 'Low Demand';
    return 'Normal';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US');
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  refreshData() {
    this.loadEventsData();
  }
}
