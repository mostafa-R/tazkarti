import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../core/interfaces/user';
import { AppService } from '../../core/services/App.service';
import { AppEvent } from '../../core/interfaces/event';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  Users!: User[];
  usersOnly: User[] = [];
  organizersOnly: User[] = [];

  filteredUsers: User[] = [];
  filteredOrganizers: {
    id: string;
    name?: string;
    userName?: string;
    firstName?: string;
    email: string;
    organizationName?: string;
    eventNames: string[];
    eventsCount: number;
  }[] = [];

  searchTerm: string = '';
  showUsers: boolean = true;
  showOrganizers: boolean = true;

  private _AppService = inject(AppService);
  private spinner = inject(NgxSpinnerService);

  ngOnInit(): void {
    this.spinner.show();
    setTimeout(() => this.spinner.hide(), 1000);

    this._AppService.getusers().subscribe({
      next: (data: User[]) => {
        console.log('Users data:', data);

        this.Users = data.map((user) => ({
          ...user,
          tickets: user.ticketsBooked || [],
        }));

        this.usersOnly = this.Users.filter((user) => user.role === 'user');
        this.organizersOnly = this.Users.filter(
          (user) => user.role === 'organizer'
        );

        console.log('Users only:', this.usersOnly.length);
        console.log('Organizers only:', this.organizersOnly.length);

        this.filteredUsers = [...this.usersOnly];

        // جلب الأحداث وربطها بالمنظمين
        this._AppService.getevents().subscribe({
          next: (events: AppEvent[]) => {
            console.log('Events data:', events);

            this.filteredOrganizers = this.organizersOnly.map((org) => {
              const orgEvents = events.filter((e) =>
                typeof e.organizer === 'string'
                  ? e.organizer === org._id
                  : e.organizer?._id === org._id
              );
              return {
                id: org._id,
                firstName: org.firstName,
                email: org.email,
                organizationName: (org as any).organizationName || '',
                eventNames: orgEvents.map((e) => e.title),
                eventsCount: orgEvents.length,
              };
            });

            console.log('Filtered organizers:', this.filteredOrganizers);
          },
          error: (err) => {
            console.error('Error fetching events:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.spinner.hide();
      },
    });
  }

  filterUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.usersOnly];
      this.filteredOrganizers = [...this.filteredOrganizers];
    } else {
      const searchLower = this.searchTerm.toLowerCase();

      this.filteredUsers = this.usersOnly.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.userName?.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
      );

      this.filteredOrganizers = this.filteredOrganizers.filter(
        (org) =>
          org.firstName?.toLowerCase().includes(searchLower) ||
          org.email?.toLowerCase().includes(searchLower) ||
          org.organizationName?.toLowerCase().includes(searchLower)
      );
    }
  }

  // تبديل عرض المستخدمين
  showUsersOnly() {
    this.showUsers = true;
    this.showOrganizers = false;
  }

  // تبديل عرض المنظمين
  showOrganizersOnly() {
    this.showUsers = false;
    this.showOrganizers = true;
  }

  // عرض الكل
  showAll() {
    this.showUsers = true;
    this.showOrganizers = true;
  }
}
