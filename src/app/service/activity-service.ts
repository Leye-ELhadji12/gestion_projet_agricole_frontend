import { computed, inject, Injectable, signal } from '@angular/core';
import { dev } from '../../environment/develpment';
import { Activity, ActivityResponse } from '../model/model';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { setErrorMessage } from '../errorMessage/message';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  currentPage = signal(0);
  pageSize = signal(10);
  currentProjectId = signal<number | null>(null);

  private http = inject(HttpClient);

  private activityUrl = computed(() => {
    const projectId = this.currentProjectId();
    const page = this.currentPage();
    const size = this.pageSize();
    if (projectId === null) {
      return '';
    }
    return `${dev.apiUrl}${dev.apiVersion}activities/${projectId}?page=${page}&size=${size}`;
  });

  private activityResource = httpResource<ActivityResponse>(this.activityUrl);

  activities = computed(() => this.activityResource.value()?.content ?? [] as Activity[]);
  totalElements = computed(() => this.activityResource.value()?.countElement ?? 0);
  totalPages = computed(() => this.activityResource.value()?.totalPages ?? 0);

  error = computed(() => this.activityResource.error() as HttpErrorResponse);
  errorMessage = computed(() => setErrorMessage(this.error(), 'Activity'));
  isLoading = this.activityResource.isLoading;

  loadPage(page: number) {
    this.currentPage.set(page);
  }

  loadActivitiesForProject(projectId: number) {
    this.currentProjectId.set(projectId);
    this.currentPage.set(0);
  }

  createActivity(projectID: number, activity: Activity): Observable<Activity> {
    return this.http.post<Activity>(`${dev.apiUrl}${dev.apiVersion}activities/${projectID}/create`, activity);
  }

  updateActivity(id: number, activity: Activity): Observable<Activity> {
    return this.http.patch<Activity>(`${dev.apiUrl}${dev.apiVersion}activities/update/${id}`, activity);
  }

  deleteActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${dev.apiUrl}${dev.apiVersion}activities/delete/${id}`);
  }

}
