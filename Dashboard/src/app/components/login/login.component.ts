import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../core/services/App.service';
import { _, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  now: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;
  LoginForm: FormGroup;
  isTranslationReady = false;
  constructor(
    private _FormBuilder: FormBuilder,
    private _Router: Router,
    private _toastr: ToastrService,
    private _AppService: AppService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.LoginForm = this._FormBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [
        null,
        [Validators.required, Validators.pattern(/^\w{2,}[@#$]/)],
      ],
    });

    this.translate.use('ar').subscribe(() => {
      this.isTranslationReady = true;
    });
  }

  submit() {
    this.isLoading = true;

    if (this.LoginForm.valid) {
      console.log(this.LoginForm.value);
      this._AppService.login(this.LoginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          setTimeout(() => {
            localStorage.setItem('userToken', res.token);
            this._AppService.saveUserData();
            this._Router.navigate(['/dashboard']);
          }, 1000);
          this._toastr.success('Login successful', 'Success');
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
          this._toastr.error(err.error.message, 'Error');
        },
      });
    } else {
      this.isLoading = false;
      this.LoginForm.markAllAsTouched();
    }
  }
}
