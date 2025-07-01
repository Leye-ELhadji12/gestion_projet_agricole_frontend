import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ActivityService } from '../service/activity-service';
import { Activity, ActivityStatus, Priorite } from '../model/model'; // Import Priorite
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-activitiesproject',
  imports: [CommonModule, DragDropModule ],
  templateUrl: './activitiesproject.html',
  styleUrl: './activitiesproject.css'
})
export class Activitiesproject implements OnInit {

  @Input() isSidebarHidden = signal(false);

  private activityService = inject(ActivityService);
  private route = inject(ActivatedRoute);

  ActivityStatus = ActivityStatus;
  Priorite = Priorite;

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

  kanbanColumnIds: string[] = Object.values(ActivityStatus).map(status => status.toString());

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const projectId = Number(params.get('id'));
      this.projectName = params.get('name');
      if (projectId) {
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

  editActivity(activity: Activity) {
    console.log('Edit activity:', activity);
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
    throw new Error('Method not implemented.');
  }

  drop(event: CdkDragDrop<Activity[]>) {
    if (event.previousContainer === event.container) {
      // Item moved within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Item moved from one list to another
      const movedActivity = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id as ActivityStatus; // Get the target column's status

      // Update the activity's status locally
      movedActivity.status = newStatus;

      // Transfer the item in the UI
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Call the service to update the activity on the backend
      // It's crucial to send the updated activity to your backend
      if (movedActivity.id) {
        this.activityService.updateActivity(movedActivity.id, movedActivity).subscribe({
          next: (updatedActivity) => {
            console.log('Activity status updated on backend:', updatedActivity);
            // Optionally, refresh activities or update the specific one in the signal
            // this.activityService.loadActivitiesForProject(this.activityService.currentProjectId()!);
          },
          error: (err) => {
            console.error('Failed to update activity status on backend:', err);
            // Revert UI change if backend update fails (optional but good for UX)
            // Or handle the error gracefully, perhaps by showing a message
          }
        });
      }
    }
  }
}


