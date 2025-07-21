// import { computed, inject, Injectable, signal } from '@angular/core';
// import { dev } from '../../environment/develpment';
// import { Activity, ActivityResponse } from '../model/model';
// import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
// import { setErrorMessage } from '../errorMessage/message';
// import { Observable, tap } from 'rxjs';


// @Injectable({
//   providedIn: 'root'
// })
// export class ActivityService {

//   currentPage = signal(0);
//   pageSize = signal(10);
//   currentProjectId = signal<number | null>(null);

//   private http = inject(HttpClient);

//   private refreshTrigger = signal(0);
//   refreshActivities() {
//     this.refreshTrigger.update(v => v + 1);
//   }

//   private activityUrl = computed(() => {
//     const projectId = this.currentProjectId();
//     const page = this.currentPage();
//     const size = this.pageSize();
//     const refresh = this.refreshTrigger();
//     if (projectId === null) {
//       return '';
//     }
//     return `${dev.apiUrl}${dev.apiVersion}activities/${projectId}?page=${page}&size=${size}`;
//   });

//   private activityResource = httpResource<ActivityResponse>(this.activityUrl);

//   activities = computed(() => this.activityResource.value()?.content ?? [] as Activity[]);
//   totalElements = computed(() => this.activityResource.value()?.countElement ?? 0);
//   totalPages = computed(() => this.activityResource.value()?.totalPages ?? 0);

//   error = computed(() => this.activityResource.error() as HttpErrorResponse);
//   errorMessage = computed(() => setErrorMessage(this.error(), 'Activity'));
//   isLoading = this.activityResource.isLoading;

//   loadPage(page: number) {
//     this.currentPage.set(page);
//   }

//   loadActivitiesForProject(projectId: number) {
//     this.currentProjectId.set(projectId);
//     this.currentPage.set(0);
//   }

//   createActivity(projectID: number, activity: Activity): Observable<Activity> {
//     return this.http.post<Activity>(`
//       ${dev.apiUrl}${dev.apiVersion}activities/${projectID}/create`,
//       activity
//     ).pipe(
//       tap(() => this.refreshActivities())
//     );
//   }

//   updateActivity(id: number, activity: Activity): Observable<Activity> {
//     return this.http.patch<Activity>(
//       `${dev.apiUrl}${dev.apiVersion}activities/update/${id}`,
//       activity
//     ).pipe(
//       tap(() => this.refreshActivities())
//     );
//   }

//   deleteActivity(id: number): Observable<void> {
//     return this.http.delete<void>(
//       `${dev.apiUrl}${dev.apiVersion}activities/delete/${id}`,
//     ).pipe(
//       tap(() => this.refreshActivities())
//     );
//   }

// }



import { computed, inject, Injectable, signal, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { dev } from '../../environment/develpment';
import { Activity, ActivityResponse } from '../model/model';
import { setErrorMessage } from '../errorMessage/message';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private http = inject(HttpClient);

  currentPage = signal(0);
  pageSize = signal(10);
  currentProjectId = signal<number | null>(null);

  private refreshTrigger = signal(0);
  refreshActivities() {
    this.refreshTrigger.update(v => v + 1);
  }

  // Ajout cache optimiste
  private localOptimistic = signal<Activity[]>([]);
  private addOptimistic(activity: Activity) {
    this.localOptimistic.update(list => [...list, activity]);
  }
  private clearOptimistic() {
    this.localOptimistic.set([]);
  }

  private activityUrl = computed(() => {
    const projectId = this.currentProjectId();
    const page = this.currentPage();
    const size = this.pageSize();
    const _r = this.refreshTrigger(); // dépendance
    if (projectId === null) return '';
    return `${dev.apiUrl}${dev.apiVersion}activities/${projectId}?page=${page}&size=${size}&_r=${_r}`;
  });

  private activityResource = httpResource<ActivityResponse>(this.activityUrl);

  // Purge cache optimiste quand nouvelles données dispo
  constructor() {
    effect(() => {
      this.activityResource.value(); // déclenchement
      this.clearOptimistic();
    });
  }

  activities = computed(() => {
    const server = this.activityResource.value()?.content ?? ([] as Activity[]);
    const optimistic = this.localOptimistic();
    if (!optimistic.length) return server;
    const serverIds = new Set(server.filter(a => a.id != null).map(a => a.id!));
    const merged = [...server, ...optimistic.filter(a => a.id == null || !serverIds.has(a.id!))];
    return merged;
  });

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
    const url = `${dev.apiUrl}${dev.apiVersion}activities/${projectID}/create`;
    return this.http.post<Activity>(url, activity).pipe(
      tap(created => {
        this.addOptimistic(created);
        this.refreshActivities();
      })
    );
  }

  updateActivity(id: number, activity: Activity): Observable<Activity> {
    const url = `${dev.apiUrl}${dev.apiVersion}activities/update/${id}`;
    return this.http.patch<Activity>(url, activity).pipe(
      tap(updated => {
        this.addOptimistic(updated);
        this.refreshActivities();
      })
    );
  }

  deleteActivity(id: number): Observable<void> {
    const url = `${dev.apiUrl}${dev.apiVersion}activities/delete/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => this.refreshActivities())
    );
  }
}
