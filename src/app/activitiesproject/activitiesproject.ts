import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ActivityService } from '../service/activity-service';
import { Activity, ActivityStatus, Priorite, Project } from '../model/model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { FormModal } from './form-modal/form-modal';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-activitiesproject',
  imports: [CommonModule, DragDropModule, FormModal ],
  templateUrl: './activitiesproject.html',
  styleUrl: './activitiesproject.css'
})
export class Activitiesproject implements OnInit {
editActivity(_t88: Activity) {
throw new Error('Method not implemented.');
}

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

  currentView = signal('table');
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

  kanbanColumnIds: string[] = Object.values(ActivityStatus).map(status => status.toString());

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const projectId = Number(params.get('id'));
      this.projectName = params.get('name');
      if (projectId) {
        this.currentProjectId.set(projectId);
        console.log(projectId, 'id projet');
        console.log(this.projectName, 'project name');
        this.activityService.loadActivitiesForProject(projectId);
      }
    });
  }

  setView(view: string) {
    this.currentView.set(view);
  }

  goToPage(page: number) {
    this.activityService.loadPage(page);
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

  closeDetailsModal() {
    this.showDetailsModal.set(false);
  }

  getActivitiesByStatus(status: ActivityStatus): Activity[] {
    return [...this.activities().filter(activity => activity.status === status)];
  }

  viewDetails(activity: Activity) {
    if (!activity.id) {
      throw new Error('Cannot view details without activity ID');
    }
    this.selectedActivity.set(activity);
    this.showDetailsModal.set(true);
  }

  addActivityToStatus(_t69: ActivityStatus) {
    this.openCreateActivityModal();
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
        this.activityService.updateActivity(movedActivity.id, movedActivity).subscribe({
          next: (updatedActivity) => {
            console.log('Activity status updated on backend:', updatedActivity);
            this.activityService.loadActivitiesForProject(this.activityService.currentProjectId()!);
          },
          error: (err) => {
            console.error('Failed to update activity status on backend:', err);
          }
        });
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
    this.deletionErrorMessage.set(null);
  }

  handleSaveActivity(activity: Activity) {
    this.deletionErrorMessage.set(null);
    if (activity.id) {
      this.activityService.updateActivity(activity.id, activity).pipe(take(1)).subscribe({
        next: () => {
          this.activityService.loadActivitiesForProject(this.currentProjectId()!);
          this.closeActivityFormModal();
        }
      });
    } else {
      if (this.currentProjectId()) {
        this.activityService.createActivity(this.currentProjectId()!, activity).pipe(take(1)).subscribe({
          next: () => {
            this.activityService.loadActivitiesForProject(this.currentProjectId()!);
            this.closeActivityFormModal();
          }
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
    // if (this.activityToDelete()) {
    //   this.activityService.deleteActivity(this.activityToDelete()!.id).subscribe({
    //     next: () => {
    //       this.activityService.loadActivitiesForProject(this.activityService.currentProjectId()!);
    //     },
    //     error: (err) => {
    //       console.error('Failed to delete activity on backend:', err);
    //       this.deletionErrorMessage.set('Une erreur est survenue lors de la suppression de l\'activité');
    //       this.showErrorMessageModal.set(true);
    //     }
    //   });
    // }
  }

}