import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Responsible, Role } from '../../model/model';

@Component({
  selector: 'app-user-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form-modal.html',
  styleUrl: './user-form-modal.css'
})
export class UserFormModal {

  private fb = inject(FormBuilder);

  @Input() set user(value: Responsible | null) {
    this.isEditing.set(!!value);
    if (value) {
      this.userForm.patchValue(value);
    } else {
      this.userForm.reset();
    }
  }

  @Output() save = new EventEmitter<Responsible>();
  @Output() cancel = new EventEmitter<void>();

  isEditing = signal(false);

  userForm = this.fb.group({
    id: new FormControl<number | null>(null),
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    role: [null as Role | null, Validators.required],
    phone: [''],
  });

  RoleOptions = Object.values(Role);

  onSave() {
    if (this.userForm.valid) {
      const userToSave: Responsible = this.userForm.value as Responsible;
      this.save.emit(userToSave);
      this.userForm.reset();
    }
  }

  onCancel() {
    this.cancel.emit();
    this.userForm.reset();
  }
}
