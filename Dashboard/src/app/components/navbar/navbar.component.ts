import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MyTranslateService } from '../../core/services/translation.service';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private _MyTranslateService = inject(MyTranslateService);
  readonly _TranslateService = inject(TranslateService);

  chooselang(lang: string): void {
    this._MyTranslateService.setLanguage(lang);
  }
}
