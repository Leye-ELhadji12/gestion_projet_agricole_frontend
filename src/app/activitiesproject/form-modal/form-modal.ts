import { Component, EventEmitter, inject, Input, Output, signal, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Activity, ActivityStatus, Priorite } from '../../model/model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-modal.html',
  styleUrl: './form-modal.css'
})
export class FormModal implements OnChanges {

  private fb = inject(FormBuilder);

  isEditing = signal(false);
  hideStatusField = signal(false);

  @Output() saveActivity = new EventEmitter<Activity>();
  @Output() cancelActivity = new EventEmitter<void>();
  @Input() kanban = false;
  @Input() projectId: number | null = null;
  @Input() presetStatus: ActivityStatus | null = null;

  ActivityStatusOptions = Object.values(ActivityStatus);
  PrioriteOptions = Object.values(Priorite);

  activityForm = this.fb.group({
    id: [null as number | null],
    title: ['', Validators.required],
    description: ['', Validators.required],
    plannedStartDate: ['', Validators.required],
    plannedEndDate: ['', Validators.required],
    actualStartDate: [null as string | null],
    priorite: [null as Priorite | null, Validators.required],
    status: [null as ActivityStatus | null, Validators.required],
  });

  @Input() set activity(value: Activity | null) {
    this.isEditing.set(!!(value && value.id != null));
    if (value) {
      const formattedActivity = {
        ...value,
        plannedStartDate: value.plannedStartDate ? new Date(value.plannedStartDate).toISOString().split('T')[0] : '',
        plannedEndDate: value.plannedEndDate ? new Date(value.plannedEndDate).toISOString().split('T')[0] : '',
        actualStartDate: value.actualStartDate ? new Date(value.actualStartDate).toISOString().split('T')[0] : '',
      };
      this.activityForm.reset();
      this.activityForm.patchValue(formattedActivity, { emitEvent: false });
    } else {
      this.activityForm.reset();
    }
    if (this.kanban && this.presetStatus) {
      this.activityForm.get('status')?.enable({ emitEvent: false });
      this.activityForm.patchValue({ status: this.presetStatus }, { emitEvent: false });
      this.activityForm.get('status')?.disable({ emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.kanban && this.presetStatus) {
      this.activityForm.get('status')?.enable({ emitEvent: false });
      this.activityForm.patchValue({ status: this.presetStatus }, { emitEvent: false });
      this.activityForm.get('status')?.disable({ emitEvent: false });
    } else {
      this.activityForm.get('status')?.enable({ emitEvent: false });
    }
  }

  private validOf(name: string): boolean {
    const c = this.activityForm.get(name);
    return !!c && c.valid;
  }

  isFormValid(): boolean {
    if (this.kanban && this.presetStatus) {
      return this.validOf('title') &&
             this.validOf('description') &&
             this.validOf('plannedStartDate') &&
             this.validOf('plannedEndDate') &&
             this.validOf('priorite');
    }
    return this.activityForm.valid;
  }

  onSaveActivity() {
    const formValue = this.activityForm.getRawValue();
    if (this.kanban && this.presetStatus) {
      formValue.status = this.presetStatus;
    }
    if (this.isFormValid()) {
      const activityToSave: Activity = {
        ...formValue,
        plannedStartDate: formValue.plannedStartDate ? new Date(formValue.plannedStartDate) : undefined,
        plannedEndDate: formValue.plannedEndDate ? new Date(formValue.plannedEndDate) : undefined,
        actualStartDate: formValue.actualStartDate ? new Date(formValue.actualStartDate) : undefined,
      } as Activity;
      this.saveActivity.emit(activityToSave);
      this.activityForm.reset();
    } else {
      this.activityForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancelActivity.emit();
    this.activityForm.reset();
  }
}
