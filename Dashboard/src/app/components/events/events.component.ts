import { Component, OnInit } from '@angular/core';
import { AppService } from '../../core/services/App.service';
import { AppEvent } from '../../core/interfaces/event';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule, TranslateModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  events: AppEvent[] = [];
  filteredEvents: AppEvent[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  selectedUpcoming: string = '';

  categories: string[] = [];
  statuses: string[] = [];

  private subscription: Subscription = new Subscription();

  constructor(private _AppService: AppService) {}

  ngOnInit(): void {
    console.log('Events component initialized');

    // جلب الأحداث الموجودة مسبقًا
    this.subscription.add(
      this._AppService.getevents().subscribe({
        next: (data: any) => {
          console.log('Fetched events:', data);

          if (data.events) {
            this.events = data.events;
            this.filteredEvents = [...data.events];
            this.extractFilterOptions();
          } else if (data && Array.isArray(data)) {
            this.events = data;
            this.filteredEvents = [...data];
            this.extractFilterOptions();
          } else {
            // Load demo data if no events found
            console.log('No events data found, loading demo data');
            this.loadDemoData();
          }
        },
        error: (err) => {
          console.log('Error fetching events:', err);
          // Load demo data on error
          console.log('Loading demo data due to error');
          this.loadDemoData();
        },
      })
    );

    // الاشتراك في الـ approvedEvents$ لمتابعة أي حدث جديد تم الموافقة عليه
    this.subscription.add(
      this._AppService.approvedEvents$.subscribe((newApprovedEvents) => {
        // ضيف أي حدث جديد لم يكن موجود مسبقًا
        newApprovedEvents.forEach((evt) => {
          if (!this.events.some((e) => e._id === evt._id)) {
            this.events.push(evt);
            this.filteredEvents.push(evt);
          }
        });
      })
    );
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.src = 'assets/events.jpg'; // الصورة الافتراضية
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private extractFilterOptions() {
    try {
      // استخراج الفئات والأنواع المتاحة للفلترة
      this.categories = [
        ...new Set(this.events.map((event) => event.category)),
      ];
      this.statuses = [...new Set(this.events.map((event) => event.status))];
      console.log('Filter options extracted:', {
        categories: this.categories,
        statuses: this.statuses,
      });
    } catch (error) {
      console.error('Error extracting filter options:', error);
      this.categories = [];
      this.statuses = [];
    }
  }

  // Search and filter functionality
  filterEvents() {
    try {
      let filtered = this.events || [];

      // Filter by search term
      if (this.searchTerm?.trim()) {
        const term = this.searchTerm.trim().toLowerCase();
        filtered = filtered.filter(
          (event) =>
            event.title?.toLowerCase().includes(term) ||
            event.description?.toLowerCase().includes(term) ||
            event.location?.venue?.toLowerCase().includes(term) ||
            event.location?.city?.toLowerCase().includes(term)
        );
      }

      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(
          (event) => event.category === this.selectedCategory
        );
      }

      // Filter by status
      if (this.selectedStatus) {
        filtered = filtered.filter(
          (event) => event.status === this.selectedStatus
        );
      }

      // Filter by upcoming status
      if (this.selectedUpcoming === 'upcoming') {
        filtered = filtered.filter((event) => event.upcoming === true);
      } else if (this.selectedUpcoming === 'past') {
        filtered = filtered.filter((event) => event.upcoming === false);
      }

      this.filteredEvents = filtered;
      console.log('Filtered events:', this.filteredEvents.length);
    } catch (error) {
      console.error('Error filtering events:', error);
      this.filteredEvents = this.events || [];
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedUpcoming = '';
    this.filteredEvents = [...this.events];
  }

  getEventStatus(date: string): string {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'past';
    else if (diffDays <= 7) return 'ongoing';
    else return 'upcoming';
  }

  getEventStatusText(date: string): string {
    const eventDate = new Date(date);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Past';
    else if (diffDays <= 7) return 'Soon';
    else return 'Upcoming';
  }

  getEventStatusClass(event: AppEvent): string {
    if (event.upcoming) return 'upcoming';
    if (event.isSoldOut) return 'sold-out';
    if (event.currentAttendees > 0) return 'ongoing';
    return 'new';
  }

  getEventStatusDisplayText(event: AppEvent): string {
    if (event.upcoming) return 'Upcoming';
    if (event.isSoldOut) return 'Sold Out';
    if (event.currentAttendees > 0) return 'Active';
    return 'New';
  }

  sortByDateDesc() {
    this.filteredEvents.sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  sortByDateAsc() {
    this.filteredEvents.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  sortByAttendees() {
    this.filteredEvents.sort((a, b) => b.currentAttendees - a.currentAttendees);
  }

  sortByAvailableSpots() {
    this.filteredEvents.sort((a, b) => b.availableSpots - a.availableSpots);
  }

  deleteEvent(event: AppEvent) {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return;

    const id = event._id;
    this._AppService.deleteEvent(id).subscribe({
      next: () => {
        this.events = this.events.filter((e) => e._id !== id);
        this.filterEvents();
        console.log('Event deleted successfully');
      },
      error: (err) => console.error('Delete Event Error:', err),
    });
  }

  getAttendancePercentage(event: AppEvent): number {
    if (event.maxAttendees === 0) return 0;
    return Math.round((event.currentAttendees / event.maxAttendees) * 100);
  }

  getGoogleMapsUrl(event: AppEvent): string {
    if (event.location?.coordinates?.lat && event.location?.coordinates?.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lng}`;
    }
    // Fallback to venue search if no coordinates
    const searchQuery = encodeURIComponent(
      `${event.location?.venue}, ${event.location?.city}`
    );
    return `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
  }

  private loadDemoData() {
    try {
      console.log('Loading demo data...');
      // Demo data based on the provided structure

      this.filteredEvents = [...this.events];
      this.extractFilterOptions();
      console.log(
        'Demo data loaded successfully:',
        this.events.length,
        'events'
      );
    } catch (error) {
      console.error('Error loading demo data:', error);
      this.events = [];
      this.filteredEvents = [];
    }
  }
}
