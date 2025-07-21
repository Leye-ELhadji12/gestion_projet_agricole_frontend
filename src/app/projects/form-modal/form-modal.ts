import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Project, ProjectStatus } from '../../model/model';

@Component({
  selector: 'app-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-modal.html',
  styleUrl: './form-modal.css'
})
export class FormModal {

  private fb = inject(FormBuilder);

  @Input() set project(value: Project | null) {
    this.isEditing.set(!!value);
    if (value) {
      const formattedProject = {
        ...value,
        startDate: value.startDate ? new Date(value.startDate).toISOString().split('T')[0] : '',
        endDate: value.endDate ? new Date(value.endDate).toISOString().split('T')[0] : '',
      };
      this.projectForm.patchValue(formattedProject);
    } else {
      this.projectForm.reset();
    }
  }

  @Output() save = new EventEmitter<Project>();
  @Output() cancel = new EventEmitter<void>();

  isEditing = signal(false);

  projectForm = this.fb.group({
    id: new FormControl<number | null>(null),
    name: ['', Validators.required],
    description: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    totalBudget: [0, [Validators.required, Validators.min(0)]],
    status: [null as ProjectStatus | null, Validators.required],
  });

  ProjectStatusOptions = Object.values(ProjectStatus);

  onSave() {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      const projectToSave: Project = {
        ...formValue,
        startDate: formValue.startDate ? new Date(formValue.startDate) : undefined,
        endDate: formValue.endDate ? new Date(formValue.endDate) : undefined,
      } as Project;
      this.save.emit(projectToSave);
      this.projectForm.reset();
    }
  }

  onCancel() {
    this.cancel.emit();
    this.projectForm.reset();
  }
}
