import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../core/services/App.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(
    private _FormBuilder: FormBuilder,
    private _Router: Router,
    private _toastr: ToastrService,
    private _AppService:AppService
  ) {}
  isLoading: boolean = false;
  showPassword: boolean = false;
  LoginForm: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.pattern(/^\w{6,}[@#$]/)]],
  });

  submit() {
    this.isLoading = true;

    if (this.LoginForm.valid) {
      this._AppService.Tokin=true
      console.log(this.LoginForm.value);
      this._toastr.success('Success', 'Hello Admin', {
        timeOut: 3000,
        progressBar: true,
        closeButton: true,
        positionClass: 'toast-bottom-right',
      });
      setTimeout(() => {
        this.isLoading = false;
        this._Router.navigate(['/dashboard']);
      }, 2000);
    } else {
      this.isLoading = false;
      this.LoginForm.markAllAsTouched();
    }
  }
}

