import { Component, EventEmitter, inject, Input, Output, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Activity, ActivityStatus, Priorite } from '../../model/model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-modal.html',
  styleUrl: './form-modal.css'
})
export class FormModal {

  private fb = inject(FormBuilder);

  isEditing = signal(false);

  @Output() saveActivity = new EventEmitter<Activity>();
  @Output() cancelActivity = new EventEmitter<void>();

  @Input() projectId: number | null = null;

  ActivityStatusOptions = Object.values(ActivityStatus);
  PrioriteOptions = Object.values(Priorite);

  activityForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    plannedStartDate: ['', Validators.required],
    plannedEndDate: ['', Validators.required],
    actualStartDate: [null as string | null],
    priorite: [null as Priorite | null, Validators.required],
    status: [null as ActivityStatus | null, Validators.required],
    projectId: [null as number | null, Validators.required],
  });

  @Input() set activity(value: Activity | null) {
    this.isEditing.set(!!value);
    if (value) {
      const formattedActivity = {
        ...value,
        plannedStartDate: value.plannedStartDate ? new Date(value.plannedStartDate).toISOString().split('T')[0] : '',
        plannedEndDate: value.plannedEndDate ? new Date(value.plannedEndDate).toISOString().split('T')[0] : '',
        actualStartDate: value.actualStartDate ? new Date(value.actualStartDate).toISOString().split('T')[0] : '',
      };
      this.activityForm.patchValue(formattedActivity);
    } else {
      this.activityForm.reset();
      if (this.projectId !== null) {
        this.activityForm.get('projectId')?.setValue(this.projectId);
      }
    }
  }

  onSave() {
    
  }

  onCancel() {
    this.cancelActivity.emit();
    this.activityForm.reset();
  }
}
