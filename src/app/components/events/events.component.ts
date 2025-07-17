import { Component } from '@angular/core';
import { AppService } from '../../core/services/App.service';
import { AppEvent } from '../../core/interfaces/event';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss',
})
export class EventsComponent {
  events: AppEvent[] = [];
  filteredEvents: AppEvent[] = [];
  searchTerm: string = '';

  constructor(private _AppService: AppService) {
    _AppService.getevents().subscribe({
      next: (data) => {
        this.events = data;
        this.filteredEvents = data;
        console.log(data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Search and filter functionality
  filterEvents() {
    if (!this.searchTerm.trim()) {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter(event =>
        event.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
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

  sortByDateDesc() {
    this.filteredEvents.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  sortByPriceDesc() {
    this.filteredEvents.sort((a, b) => b.price - a.price);
  }

  deleteEvent(event: AppEvent) {
    const id: string = event.id;
    this._AppService.deletEvent(id).subscribe({
      next: (data) => {
        console.log("deleted", data);
        this.events = this.events.filter((e) => e.id !== id);
        this.filterEvents(); // Re-filter after deletion
      }
    });
  }
}
