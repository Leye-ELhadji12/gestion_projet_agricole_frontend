// import { Component, effect, inject, Input, OnInit, signal } from '@angular/core';
// import { ActivityService } from '../service/activity-service';
// import { Activity, ActivityStatus, Priorite, Project } from '../model/model';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';
// import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
// import { FormModal } from './form-modal/form-modal';
// import { finalize, take } from 'rxjs/operators';

// @Component({
//   selector: 'app-activitiesproject',
//   imports: [CommonModule, DragDropModule, FormModal ],
//   templateUrl: './activitiesproject.html',
//   styleUrl: './activitiesproject.css'
// })
// export class Activitiesproject implements OnInit {

//   @Input() isSidebarHidden = signal(false);

//   private activityService = inject(ActivityService);
//   private route = inject(ActivatedRoute);

//   ActivityStatus = ActivityStatus;
//   Priorite = Priorite;

//   activityToEdit = signal<Activity | null>(null);
//   activityToDelete = signal<Activity | null>(null);
//   deletionErrorMessage = signal<string | null>(null);

//   showActivityFormModal = signal(false);
//   showConfirmationModal = signal(false);
//   showErrorMessageModal = signal(false);
//   // activities = signal<Activity[]>([]);


//   currentView = signal('table');
//   showDetailsModal = signal(false);
//   selectedActivity = signal<Activity | null>(null);

//   // activities = this.activityService.activities;
//   Loading = this.activityService.isLoading;
//   error = this.activityService.errorMessage;

//   currentPage = this.activityService.currentPage;
//   pageSize = this.activityService.pageSize;
//   totalPages = this.activityService.totalPages;
//   totalElements = this.activityService.totalElements;

//   projectName: string | null = '';
//   currentProjectId = signal<number | null>(null);

//   kanbanColumnIds: string[] = Object.values(ActivityStatus).map(status => status.toString());

//   activities = signal<Activity[]>([]);

//   ngOnInit(): void {
//     this.route.paramMap.subscribe(params => {
//       const projectId = Number(params.get('id'));
//       this.projectName = params.get('name');
//       if (projectId) {
//         this.currentProjectId.set(projectId);
//         this.activityService.loadActivitiesForProject(projectId);
//         // On se synchronise avec le service
//         effect(() => {
//           this.activities.set(this.activityService.activities());
//         });
//       }
//     });
//   }


//   presetStatus = signal<ActivityStatus | null>(null);


//   isKanban = signal(false);
//   setView(view: string) {
//     this.currentView.set(view);
//     if (view === 'kanban') {
//       this.isKanban.set(true);
//       console.log('kanban true');
      
//     }
//     else {
//       this.isKanban.set(false);
//       console.log('kanban false');
      
//     }
//   }

//   goToPage(page: number) {
//     this.activityService.loadPage(page);
//   }

//   previousPage() {
//     if (this.currentPage() > 0) {
//       this.goToPage(this.currentPage() - 1);
//     }
//   }

//   nextPage() {
//     if (this.currentPage() < this.totalPages() - 1) {
//       this.goToPage(this.currentPage() + 1);
//     }
//   }

//   closeDetailsModal() {
//     this.showDetailsModal.set(false);
//   }

//   getActivitiesByStatus(status: ActivityStatus): Activity[] {
//     return [...this.activities().filter(activity => activity.status === status)];
//   }

//   viewDetails(activity: Activity) {
//     if (!activity.id) {
//       throw new Error('Cannot view details without activity ID');
//     }
//     this.selectedActivity.set(activity);
//     this.showDetailsModal.set(true);
//   }

//   addActivityToStatus(status: ActivityStatus) {
//     this.activityToEdit.set(null);
//     this.presetStatus.set(status);
//     this.showActivityFormModal.set(true);
//     this.deletionErrorMessage.set(null);
//     this.openCreateActivityModal();
//   }

//   editActivity(activity: Activity) {
//     this.activityToEdit.set(activity);
//     this.showActivityFormModal.set(true);
//     this.deletionErrorMessage.set(null);
//   }

//   drop(event: CdkDragDrop<Activity[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       const movedActivity = event.previousContainer.data[event.previousIndex];
//       const newStatus = event.container.id as ActivityStatus;
//       movedActivity.status = newStatus;
//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       );
//       if (movedActivity.id) {
//         this.activityService.updateActivity(movedActivity.id, movedActivity).subscribe({
//           // next: (updatedActivity) => {
//           //   console.log('Activity status updated on backend:', updatedActivity);
//           //   // this.activityService.loadActivitiesForProject(this.activityService.currentProjectId()!);
//           // },
//           // error: (err) => {
//           //   console.error('Failed to update activity status on backend:', err);
//           // }
//         });
//       }
//     }
//   }

//   openCreateActivityModal() {
//     this.activityToEdit.set(null);
//     this.showActivityFormModal.set(true);
//     this.deletionErrorMessage.set(null);
//   }

//   openEditActivityModal(activity: Activity) {
//     this.activityToEdit.set(activity);
//     this.showActivityFormModal.set(true);
//     this.deletionErrorMessage.set(null);
//   }

//   closeActivityFormModal() {
//     this.showActivityFormModal.set(false);
//     this.activityToEdit.set(null);
//     this.deletionErrorMessage.set(null);
//   }

//   // handleSaveActivity(activity: Activity) {
//   //   this.deletionErrorMessage.set(null);
//   //   if (activity.id) {
//   //     this.activityService.updateActivity(activity.id, activity)
//   //     .pipe(take(1), finalize(() => this.activityService.refreshActivities())).subscribe({
//   //       next: () => {
//   //         // this.activityService.loadActivitiesForProject(this.currentProjectId()!);
//   //         this.closeActivityFormModal();
//   //       }
//   //     });
//   //   } else {
//   //     if (this.currentProjectId()) {
//   //       this.activityService.createActivity(this.currentProjectId()!, activity).subscribe({
//   //         next: () => {
//   //           // this.activityService.loadActivitiesForProject(this.currentProjectId()!);
//   //           this.closeActivityFormModal();
//   //         }
//   //       });
//   //     } else {
//   //       this.deletionErrorMessage.set('Impossible de créer l\'activité: L\'ID du projet est manquant.');
//   //       this.showErrorMessageModal.set(true);
//   //     }
//   //   }
//   // }

//   handleSaveActivity(activity: Activity) {
//     this.deletionErrorMessage.set(null);

//     if (activity.id) {
//       // Cas édition
//       this.activityService.updateActivity(activity.id, activity)
//         .pipe(take(1))
//         .subscribe({
//           next: () => {
//             this.closeActivityFormModal();
//           }
//         });
//     } else {
//       // Cas création
//       if (this.currentProjectId()) {
//         this.activityService.createActivity(this.currentProjectId()!, activity)
//           .pipe(take(1))
//           .subscribe({
//             next: (createdActivity) => {
//               // Injection immédiate dans la liste Kanban
//               this.activities.update((list) => [...list, createdActivity]);
//               this.closeActivityFormModal();
//             }
//           });
//       } else {
//         this.deletionErrorMessage.set('Impossible de créer l\'activité: L\'ID du projet est manquant.');
//         this.showErrorMessageModal.set(true);
//       }
//     }
//   }


//   openDeleteActivityConfirmation(activity: Activity) {
//     this.activityToDelete.set(activity);
//     this.showConfirmationModal.set(true);
//     this.deletionErrorMessage.set(null);
//   }

//   closeConfirmationModal() {
//     this.showConfirmationModal.set(false);
//     this.activityToDelete.set(null);
//     this.deletionErrorMessage.set(null);
//   }

//   closeErrorMessageModal() {
//     this.showErrorMessageModal.set(false);
//     this.deletionErrorMessage.set(null);
//   }

//   handleConfirmDelete() {
//     if (this.activityToDelete() && this.activityToDelete()!.id) {
//       console.log(this.activityToDelete()!.id, 'id activity to delete');

//       // this.activityService.deleteActivity(this.activityToDelete()!.id).subscribe({
//       //   next: () => {
//       //     this.activityService.loadActivitiesForProject(this.activityService.currentProjectId()!);
//       //   },
//       //   error: (err) => {
//       //     console.error('Failed to delete activity on backend:', err);
//       //     this.deletionErrorMessage.set('Une erreur est survenue lors de la suppression de l\'activité');
//       //     this.showErrorMessageModal.set(true);
//       //   }
//       // });
//     }
//   }

// }



import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { finalize, take } from 'rxjs/operators';

import { ActivityService } from '../service/activity-service';
import { Activity, ActivityStatus, Priorite } from '../model/model';
import { FormModal } from './form-modal/form-modal';

@Component({
  selector: 'app-activitiesproject',
  imports: [CommonModule, DragDropModule, FormModal],
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

  ngOnInit(): void {
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
    if (this.activityToDelete() && this.activityToDelete()!.id) {
      // suppression backend (commentée chez toi)
      // this.activityService.deleteActivity(this.activityToDelete()!.id).pipe(take(1)).subscribe();
    }
  }
}
