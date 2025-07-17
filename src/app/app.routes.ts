import { Routes } from '@angular/router';
import { loginGuard } from './core/guards/login.guard';
import { WaitingEventsComponent } from './components/waiting-events/waiting-events.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'Login',
  },
  {
    path: '',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./layouts/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Dashboard',
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./components/events/events.component').then(
            (m) => m.EventsComponent
          ),
        title: 'Events',
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./components/users/users.component').then(
            (m) => m.UsersComponent
          ),
        title: 'Users',
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./components/tickets/tickets.component').then(
            (m) => m.TicketsComponent
          ),
        title: 'Tickets',
      },
      {
        path: 'update/:id',
        loadComponent: () =>
          import('./components/update/update.component').then(
            (m) => m.UpdateComponent
          ),
        title: 'Update',
      },
      {
        path: 'waiting',
        loadComponent: () =>
          import('./components/waiting-events/waiting-events.component').then(
            (m) => m.WaitingEventsComponent
          ),
        title: 'Notifications',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/notfound/notfound.component').then(
        (m) => m.NotfoundComponent
      ),
    title: 'NotFound',
  },
];
