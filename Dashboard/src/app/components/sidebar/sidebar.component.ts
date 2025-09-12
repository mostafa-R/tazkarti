import { TranslateModule } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private _Router = inject(Router);
  logout(){
    localStorage.removeItem('userToken');
    this._Router.navigate(['/login']);
  }
}
