import {  Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../core/services/App.service';
import { ActivatedRoute } from '@angular/router';
import { AppEvent } from '../../core/interfaces/event';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent {
  id: string = '';
  formData!: AppEvent;
  formUpdate!: FormGroup;

  constructor(
    private _fb: FormBuilder,
    private _AppService: AppService,
    private _ActivatedRoute: ActivatedRoute,
  ) {
    this._ActivatedRoute.params.subscribe({
      next: (params) => {
        this.id = params['id'];
        console.log('Event ID:', this.id);
      },
    });
  }

  ngOnInit(): void {
    this._AppService.geteventById(this.id).subscribe({
      next: (data) => {
        this.formData = data;
        console.log('Event Data:', data);
        this.initForm();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  initForm() {
    this.formUpdate =this._fb.group({
      name: [this.formData.name, [Validators.required , Validators.minLength(3)]],
      location: [this.formData.location, [Validators.required , Validators.minLength(5)]],
      date: [this.formData.date, Validators.required],
      price: [this.formData.price, [Validators.required, Validators.min(0)]],
      tickets: [
        this.formData.tickets,
        [Validators.required],
      ],
    });
  }

  onSubmit() {
    console.log(this.formUpdate.value);
    const event = this.formUpdate.value;
    this._AppService.updateEvent(event , this.id).subscribe({
      next:(data)=>{
        console.log("updated" , data);
      }
    })

  }
}




// formUpdate: FormGroup = this._fb.group({
//   name: [null, [Validators.required, Validators.minLength(2)]],
//   location: [null, [Validators.required]],
//   Date: [null, [Validators.required]],
//   price: [null, [Validators.required]],
//   tickets: [null, [Validators.required]],
// });
