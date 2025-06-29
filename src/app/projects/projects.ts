import { Component, signal, Input, inject } from '@angular/core';
import { ProjectsService } from '../service/projects-service';
import { CurrencyPipe, DatePipe, CommonModule, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Project, ProjectStatus } from '../model/model';
import { DetailProject } from "../detail-project/detail-project";
import { RouterLink } from '@angular/router';
import { FormModal } from '../projects/form-modal/form-modal';
import { take } from 'rxjs/operators';
import { ConfirmationModal } from './confirmation-modal/confirmation-modal';
import { ErrorMessageModal } from './error-message-modal/error-message-modal';
import { HttpErrorResponse } from '@angular/common/http';

registerLocaleData(localeFr);

@Component({
  selector: 'app-projects',
  imports: [DatePipe, CurrencyPipe, CommonModule, DetailProject, RouterLink, FormModal, ConfirmationModal, ErrorMessageModal ],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects {

  @Input() isSidebarHidden = signal(false);

  private projectService = inject(ProjectsService);

  showDetailsModal = signal(false);
  showProjectFormModal = signal(false);
  showConfirmationModal = signal(false);
  showErrorMessageModal = signal(false);

  projectToEdit = signal<Project | null>(null);
  projectToDelete = signal<Project | null>(null);

  currentView = signal('table');

  projects = this.projectService.projects;
  error = this.projectService.errorMessage;
  Loading = this.projectService.isLoading;
  selectedProject = signal<Project | null>(null);

  deletionErrorMessage = signal<string | null>(null);

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

  openCreateProjectModal() {
    this.projectToEdit.set(null);
    this.showProjectFormModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  openEditProjectModal(project: Project) {
    this.projectToEdit.set(project);
    this.showProjectFormModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  closeProjectFormModal() {
    this.showProjectFormModal.set(false);
    this.projectToEdit.set(null);
    this.deletionErrorMessage.set(null);
  }

  handleSaveProject(project: Project) {
    this.deletionErrorMessage.set(null);
    if (project.id) {
      this.projectService.updateProject(project.id, project).pipe(take(1)).subscribe({
        next: () => {
          this.projectService.loadPage(this.currentPage());
          this.closeProjectFormModal();
        },
        error: (err) => {
          console.error('Error updating project:', err);
        }
      });
    } else {
      this.projectService.createProject(project).pipe(take(1)).subscribe({
        next: () => {
          this.projectService.loadPage(this.currentPage());
          this.closeProjectFormModal();
        },
        error: (err) => {
          console.error('Error creating project:', err);
        }
      });
    }
  }

  openDeleteProjectConfirmation(project: Project) {
    this.projectToDelete.set(project);
    this.showConfirmationModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  closeConfirmationModal() {
    this.showConfirmationModal.set(false);
    this.projectToDelete.set(null);
    this.deletionErrorMessage.set(null);
  }

  closeErrorMessageModal() {
    this.showErrorMessageModal.set(false);
    this.deletionErrorMessage.set(null);
  }

  handleConfirmDelete() {
    const project = this.projectToDelete();
    if (project && project.id) {
      this.projectService.deleteProject(project.id).pipe(take(1)).subscribe({
        next: () => {
          this.projectService.loadPage(this.currentPage());
          this.closeConfirmationModal();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting project:', err);
          this.closeConfirmationModal();
          const userFriendlyForeignKeyMessage = `Vous devez d'abord supprimer toutes les activités liées à ce projet pour pouvoir supprimer ce projet.`;
          const genericErrorMessage = `Vous devez d'abord supprimer toutes les activités liées à ce projet pour pouvoir supprimer ce projet.Une erreur inattendue est survenue lors de la suppression du projet. Veuillez réessayer.`;
          let messageToDisplay = genericErrorMessage;
          if (err.status === 500 && err.error) {
            if (
              (err.error.message && String(err.error.message).toLowerCase().includes('dataintegrityviolationexception') && String(err.error.message).toLowerCase().includes('foreign key')) ||
              (err.error.trace && String(err.error.trace).toLowerCase().includes('dataintegrityviolationexception') && String(err.error.trace).toLowerCase().includes('foreign key'))
            ) {
              messageToDisplay = userFriendlyForeignKeyMessage;
            }
          }
          this.deletionErrorMessage.set(messageToDisplay);
          this.showErrorMessageModal.set(true);
        }
      });
    }
  }

  getProjectsByStatus(status: ProjectStatus): Project[] {
    return this.projects().filter(project => project.status.trim() === status.trim());
  }

}
