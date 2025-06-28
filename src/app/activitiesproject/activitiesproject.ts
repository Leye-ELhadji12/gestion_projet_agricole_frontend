import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ActivityService } from '../service/activity-service';
import { Activity, ActivityStatus, Priorite } from '../model/model'; // Import Priorite
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-activitiesproject',
  imports: [CommonModule ],
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

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const projectId = Number(params.get('id'));
      if (projectId) {
        console.log(projectId, 'id projet');
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
    return this.activities().filter(activity => activity.status.trim() === status.trim());
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
}
