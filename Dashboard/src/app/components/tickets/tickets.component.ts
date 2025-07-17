import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventTicketStats } from '../../core/interfaces/tickets';
import { AppService } from '../../core/services/App.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  totalTickets: number = 0;
  totalReserved: number = 0;
  totalAvailable: number = 0;

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.loadEventsData();
  }

  loadEventsData() {
    this.loading = true;
    this.appService.getEventTicketStats().subscribe({
      next: (data) => {
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
    this.totalTickets = this.events.reduce((sum, event) => sum + event.totalTickets, 0);
    this.totalReserved = this.events.reduce((sum, event) => sum + event.reservedTickets, 0);
    this.totalAvailable = this.events.reduce((sum, event) => sum + event.availableTickets, 0);
  }

  onSearch() {
    this.filterEvents();
  }

  filterEvents() {
    let filtered = this.events.filter(event => 
      event.eventName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      event.eventLocation.toLowerCase().includes(this.searchTerm.toLowerCase())
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
