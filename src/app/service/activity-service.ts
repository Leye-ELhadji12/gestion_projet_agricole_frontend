import { computed, Injectable, signal } from '@angular/core';
import { dev } from '../../environment/develpment';
import { Activity, ActivityResponse } from '../model/model';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { setErrorMessage } from '../errorMessage/message';


@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  currentPage = signal(0);
  pageSize = signal(10);
  currentProjectId = signal<number | null>(null);

  private activityUrl = computed(() => {
    const projectId = this.currentProjectId();
    const page = this.currentPage();
    const size = this.pageSize();
    return `${dev.apiUrl}${dev.apiVersion}activities/${projectId}?page=${page}&size=${size}`;
  });

  private activityResource = httpResource<ActivityResponse>(this.activityUrl);

  activities = computed(() => this.activityResource.value()?.content ?? [] as Activity[]);
  totalElements = computed(() => this.activityResource.value()?.countElement ?? 0);
  totalPages = computed(() => this.activityResource.value()?.totalPages ?? 0);

  error = computed(() => this.activityResource.error() as HttpErrorResponse);
  errorMessage = computed(() => setErrorMessage(this.error(), 'Activity'));
  isLoading = this.activityResource.isLoading; // Direct access to isLoading signal

  loadPage(page: number) {
    this.currentPage.set(page);
  }

  loadActivitiesForProject(projectId: number) {
    this.currentProjectId.set(projectId);
    this.currentPage.set(0);
  }

}
