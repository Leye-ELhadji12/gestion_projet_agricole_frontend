import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ProjectsService } from '../service/projects-service';
import { Project } from '../model/model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-project',
  imports: [CommonModule],
  templateUrl: './detail-project.html',
  styleUrl: './detail-project.css'
})
export class DetailProject {

  private projectService = inject(ProjectsService);

  @Input() project!: Project;
  @Output() closeModalDetail = new EventEmitter<void>();

  detailProject = this.projectService.detailProject;
  detailError = this.projectService.errorDetail;

  closeModal() {
    this.closeModalDetail.emit();
  }

}
