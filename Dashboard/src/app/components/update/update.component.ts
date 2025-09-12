import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppService } from '../../core/services/App.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppEvent } from '../../core/interfaces/event';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent {
  id: string = '';
  formData!: AppEvent;
  formUpdate!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _AppService: AppService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _Toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // تهيئة مبدأية
    this.formUpdate = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      time: ['', Validators.required],
    });

    // بعدين نجيب الداتا
    this.id = this._ActivatedRoute.snapshot.params['id'];
    this._AppService.geteventById(this.id).subscribe({
      next: (data) => {
        this.formData = data;
        this.formUpdate.patchValue({
          title: this.formData.title,
          startDate: this.formatDate(this.formData.startDate),
          endDate: this.formatDate(this.formData.endDate),
          time: this.formatTime(this.formData.time),
        });
      },
      error: (err) => console.error('Get Event Error:', err),
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.split('T')[0]; // yyyy-MM-dd
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    return timeString.substring(0, 5); // hh:mm
  }

  initForm() {
    this.formUpdate = this._fb.group({
      title: [
        this.formData.title || '',
        [Validators.required, Validators.minLength(3)],
      ],
      startDate: [this.formData.startDate || '', Validators.required],
      endDate: [this.formData.endDate || '', Validators.required],
      time: [this.formData.time || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.formUpdate.invalid) {
      this.formUpdate.markAllAsTouched();
      return;
    }

    const event: Partial<AppEvent> = this.formUpdate.value;
    this._AppService.updateEvent(event, this.id).subscribe({
      next: (data) => {
        this._Toastr.success('Event updated successfully');
        this._Router.navigate(['/events']);
        console.log('Event updated', data);
      },
      error: (err) => console.error('Update Event Error:', err),
    });
  }
}
