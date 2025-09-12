import { inject, Injectable, RendererFactory2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class MyTranslateService {
  private _TranslateService = inject(TranslateService);

  private _Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this._TranslateService.setDefaultLang('en');

      let Savedlang = localStorage.getItem('lang');

      if (Savedlang !== null) {
        this._TranslateService.use(Savedlang);
      }

      this.ChangeDirection();
    }
  }

  ChangeDirection() {
    if (localStorage.getItem('lang') === 'en') {
      this._Renderer2.setAttribute(document.documentElement, 'dir', 'ltr');
      this._Renderer2.setAttribute(document.documentElement, 'lang', 'en');
    } else if (localStorage.getItem('lang') === 'ar') {
      this._Renderer2.setAttribute(document.documentElement, 'dir', 'rtl');
      this._Renderer2.setAttribute(document.documentElement, 'lang', 'ar');
    }
  }

  setLanguage(lang: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('lang', lang);
      this._TranslateService.use(lang);
      this.ChangeDirection();
    }
  }
}
