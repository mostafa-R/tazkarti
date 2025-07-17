import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppService } from '../services/App.service';

export const loginGuard: CanActivateFn = (route, state) => {
  const app = inject(AppService);
  const _Router = inject(Router);
if(app.Tokin == true)
{
  return true
}
else
{
  _Router.navigate(['/login']);
  return false
}

};
