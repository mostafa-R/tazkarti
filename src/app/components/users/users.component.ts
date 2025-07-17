import { Component, inject, OnInit } from '@angular/core';
import { User } from '../../core/interfaces/user';
import { AppService } from '../../core/services/App.service';
import { AppEvent } from '../../core/interfaces/event';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  Users!: User[];
  usersOnly: User[] = [];
  organizersOnly: User[] = [];
  
  // Filtered arrays for search functionality
  filteredUsers: User[] = [];
  filteredOrganizers: {
    id: string;
    name: string;
    email: string;
    eventNames: string[];
  }[] = [];
  
  organizersWithEvents: {
    id: string;
    name: string;
    email: string;
    eventNames: string[];
  }[] = [];

  // Search and filter properties
  searchTerm: string = '';
  showUsers: boolean = true;
  showOrganizers: boolean = true;

  private _AppService = inject(AppService);

  ngOnInit(): void {
    this._AppService.getusers().subscribe({
      next: (data: User[]) => {
        this.Users = data.map((user) => ({
          ...user,
          tickets: user.tickets || [], 
        }));

        this.usersOnly = this.Users.filter(
          (user: User) => user.role === 'user'
        );
        this.organizersOnly = this.Users.filter(
          (user: User) => user.role === 'organizer'
        );

        // Initialize filtered arrays
        this.filteredUsers = this.usersOnly;

        this.usersOnly = data.filter((user: User) => user.role === 'user');
        this.organizersOnly = data.filter(
          (user: User) => user.role === 'organizer'
        );
        
        // Initialize filtered arrays
        this.filteredUsers = this.usersOnly;

        this._AppService.getevents().subscribe({
          next: (events: AppEvent[]) => {
            this.organizersWithEvents = this.organizersOnly.map((org) => {
              const userEvents = events.filter(
                (event) => event.organizerId === org.id
              );
              return {
                id: org.id,
                name: org.name,
                email: org.email,
                eventNames: userEvents.map((ev) => ev.name),
              };
            });
            
            // Initialize filtered organizers
            this.filteredOrganizers = this.organizersWithEvents;
          },
          error: (err) => {
            console.log(err);
          },
        });
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  // Search and filter functionality
  filterUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.usersOnly;
      this.filteredOrganizers = this.organizersWithEvents;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      
      // Filter users
      this.filteredUsers = this.usersOnly.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
      
      // Filter organizers
      this.filteredOrganizers = this.organizersWithEvents.filter(org =>
        org.name.toLowerCase().includes(searchLower) ||
        org.email.toLowerCase().includes(searchLower)
      );
    }
  }

  // Delete user functionality
  // deleteUser(user: User | any) {
  //   if (confirm('Are you sure you want to delete this user?')) {
  //     this._AppService.deleteUser(user.id).subscribe({
  //       next: (data) => {
  //         console.log("User deleted", data);
          
  //         // Remove from arrays
  //         this.Users = this.Users.filter(u => u.id !== user.id);
  //         this.usersOnly = this.usersOnly.filter(u => u.id !== user.id);
  //         this.organizersOnly = this.organizersOnly.filter(u => u.id !== user.id);
          
  //         // Re-filter
  //         this.filterUsers();
  //       },
  //       error: (err) => {
  //         console.log("Error deleting user", err);
  //       }
  //     });
  //   }
  // }
}


