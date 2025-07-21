import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';

import { ActivityService } from '../service/activity-service';
import { Activity, ActivityStatus, Priorite } from '../model/model';
import { FormModal } from './form-modal/form-modal';
import { ConfirmationModal } from '../projects/confirmation-modal/confirmation-modal';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorMessageModal } from './error-message-modal/error-message-modal';

@Component({
  selector: 'app-activitiesproject',
  imports: [ CommonModule, DragDropModule, FormModal, ConfirmationModal, ErrorMessageModal ],
  templateUrl: './activitiesproject.html',
  styleUrl: './activitiesproject.css'
})
export class Activitiesproject implements OnInit {

  @Input() isSidebarHidden = signal(false);

  private activityService = inject(ActivityService);
  private route = inject(ActivatedRoute);

  ActivityStatus = ActivityStatus;
  Priorite = Priorite;

  activityToEdit = signal<Activity | null>(null);
  activityToDelete = signal<Activity | null>(null);
  deletionErrorMessage = signal<string | null>(null);

  showActivityFormModal = signal(false);
  showConfirmationModal = signal(false);
  showErrorMessageModal = signal(false);

  currentView = signal<'table' | 'kanban'>('table');
  showDetailsModal = signal(false);
  selectedActivity = signal<Activity | null>(null);

  activities = this.activityService.activities;
  Loading = this.activityService.isLoading;
  error = this.activityService.errorMessage;

  currentPage = this.activityService.currentPage;
  pageSize = this.activityService.pageSize;
  totalPages = this.activityService.totalPages;
  totalElements = this.activityService.totalElements;

  projectName: string | null = '';
  currentProjectId = signal<number | null>(null);

  presetStatus = signal<ActivityStatus | null>(null);

  kanbanColumnIds: string[] = Object.values(ActivityStatus).map(s => s.toString());

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const projectId = Number(params.get('id'));
      this.projectName = params.get('name');
      if (projectId) {
        this.currentProjectId.set(projectId);
        this.activityService.loadActivitiesForProject(projectId);
      }
    });
  }

  isKanban = signal(false);
  setView(view: 'table' | 'kanban') {
    this.currentView.set(view);
    this.isKanban.set(view === 'kanban');
  }

  goToPage(page: number) {
    this.activityService.loadPage(page);
  }

  previousPage() {
    if (this.currentPage() > 0) this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) this.goToPage(this.currentPage() + 1);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
  }

  getActivitiesByStatus(status: ActivityStatus): Activity[] {
    return this.activities().filter(a => a.status === status);
  }

  viewDetails(activity: Activity) {
    if (!activity.id) throw new Error('Cannot view details without activity ID');
    this.selectedActivity.set(activity);
    this.showDetailsModal.set(true);
  }

  addActivityToStatus(status: ActivityStatus) {
    this.activityToEdit.set(null);
    this.presetStatus.set(status);
    this.showActivityFormModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  editActivity(activity: Activity) {
    this.activityToEdit.set(activity);
    this.presetStatus.set(activity.status ?? null);
    this.showActivityFormModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  drop(event: CdkDragDrop<Activity[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedActivity = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id as ActivityStatus;
      movedActivity.status = newStatus;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (movedActivity.id) {
        this.activityService.updateActivity(movedActivity.id, movedActivity).pipe(take(1)).subscribe();
      }
    }
  }

  openCreateActivityModal() {
    this.activityToEdit.set(null);
    this.showActivityFormModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  openEditActivityModal(activity: Activity) {
    this.activityToEdit.set(activity);
    this.showActivityFormModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  closeActivityFormModal() {
    this.showActivityFormModal.set(false);
    this.activityToEdit.set(null);
    this.presetStatus.set(null);
    this.deletionErrorMessage.set(null);
  }

  handleSaveActivity(activity: Activity) {
    this.deletionErrorMessage.set(null);

    if (this.isKanban() && this.presetStatus()) {
      activity.status = this.presetStatus()!;
    }

    if (activity.id) {
      this.activityService.updateActivity(activity.id, activity)
        .pipe(take(1))
        .subscribe({
          next: () => this.closeActivityFormModal()
        });
    } else {
      const pid = this.currentProjectId();
      if (pid != null) {
        this.activityService.createActivity(pid, activity)
          .pipe(take(1))
          .subscribe({
            next: () => this.closeActivityFormModal()
          });
      } else {
        this.deletionErrorMessage.set('Impossible de créer l\'activité: L\'ID du projet est manquant.');
        this.showErrorMessageModal.set(true);
      }
    }
  }

  openDeleteActivityConfirmation(activity: Activity) {
    this.activityToDelete.set(activity);
    this.showConfirmationModal.set(true);
    this.deletionErrorMessage.set(null);
  }

  closeConfirmationModal() {
    this.showConfirmationModal.set(false);
    this.activityToDelete.set(null);
    this.deletionErrorMessage.set(null);
  }

  closeErrorMessageModal() {
    this.showErrorMessageModal.set(false);
    this.deletionErrorMessage.set(null);
  }

  handleConfirmDelete() {
    const activity = this.activityToDelete();
    if (activity && activity.id) {
      this.activityService.deleteActivity(activity!.id).pipe(take(1)).subscribe({
        next: () => {
          this.activityService.loadActivitiesForProject(this.currentProjectId()!);
          this.closeConfirmationModal();
        },
        error: (err: HttpErrorResponse) => {
          this.closeConfirmationModal();
          const userFriendlyForeignKeyMessage = `Vous devez d'abord supprimer toutes les documents liées à cette activité.`;
          const genericErrorMessage = `Une erreur inattendue est survenue lors de la suppression de l'activité. Veuillez réessayer.`;
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

}
