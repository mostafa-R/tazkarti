import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppService } from '../services/App.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const app = inject(AppService);
  const _Router = inject(Router);

  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem('userToken') !== null) {
      return true;
    } else {
      return _Router.createUrlTree(['/login']);
    }
  } else {
    return _Router.createUrlTree(['/login']);
  }
};
