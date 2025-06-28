import { Component, signal, Input, inject } from '@angular/core';
import { ProjectsService } from '../service/projects-service';
import { CurrencyPipe, DatePipe, CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Project, ProjectStatus } from '../model/model';
import { DetailProject } from "../detail-project/detail-project";
import { RouterLink } from '@angular/router';

registerLocaleData(localeFr);

@Component({
  selector: 'app-projects',
  imports: [DatePipe, CurrencyPipe, CommonModule, DetailProject, RouterLink ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {

  @Input() isSidebarHidden = signal(false);

  private projectService = inject(ProjectsService);

  showDetailsModal = signal(false);
  currentView = signal('table');

  projects = this.projectService.projects;
  error = this.projectService.errorMessage;
  Loading = this.projectService.isLoading;
  selectedProject = signal<Project | null>(null);;

  ProjectStatus = ProjectStatus;

  currentPage = this.projectService.currentPage;
  pageSize = this.projectService.pageSize;
  totalPages = this.projectService.totalPages;
  totalElements = this.projectService.totalElements;

  setView(view: string) {
    this.currentView.set(view);
  }

  goToPage(page: number) {
    this.projectService.loadPage(page);
  }

  previousPage() {
    if (this.currentPage() > 0) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  viewDetails(project: Project) {
    this.selectedProject.set(project);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
  }

  editProject(project: Project) {
    throw new Error('Method not implemented.');
  }

  getProjectsByStatus(status: ProjectStatus): Project[] {
    return this.projects().filter(project => project.status.trim() === status.trim());
  }

}
