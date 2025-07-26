import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpErrorResponse, httpResource, HttpClient} from '@angular/common/http';
import { dev } from '../../environment/develpment';
import { Project, ProjectResponse } from '../model/model';
import { setErrorMessage } from '../errorMessage/message';
import { Observable } from 'rxjs';
import { Responsible } from '../model/model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private http = inject(HttpClient);

  currentPage = signal(0);
  pageSize = signal(10);
  selectedProject = signal<number>(0);

  private projectsUrl = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    return `${dev.apiUrl}${dev.apiVersion}projects?page=${page}&size=${size}`;
  });

  private projectsResource = httpResource<ProjectResponse>(this.projectsUrl);
  private projectResource = httpResource<Project>(() =>
        `${dev.apiUrl}${dev.apiVersion}projects/${this.selectedProject()}`
  );

  projects = computed(() => this.projectsResource.value()?.content ?? [] as Project[]);
  totalElements = computed(() => this.projectsResource.value()?.totalElements ?? 0);
  totalPages = computed(() => this.projectsResource.value()?.totalPages ?? 0);
  error = computed(() => this.projectsResource.error() as HttpErrorResponse);
  errorMessage = computed(() => setErrorMessage(this.error(), 'Project'));
  isLoading = this.projectsResource.isLoading;

  detailProject = computed(() => this.projectResource.value() ?? {} as Project);
  errorDetail = computed(() => setErrorMessage(this.error(), 'Project details'));
  isDetailLoading = this.projectResource.isLoading;

  loadPage(page: number) {
    this.currentPage.set(page);
  }

  createProject(project: Project) {
    return this.http.post<Project>(`${dev.apiUrl}${dev.apiVersion}projects/create`, project);
  }

  updateProject(projectId: number, project: Project) {
    return this.http.patch<Project>(`${dev.apiUrl}${dev.apiVersion}projects/update/${projectId}`, project);
  }

  deleteProject(projectId: number) {
    return this.http.delete<void>(`${dev.apiUrl}${dev.apiVersion}projects/delete/${projectId}`);
  }

  addResponsiblesToProject(projectId: number, responsibleIds: Set<number>): Observable<Project> {
    console.log('Envoi au backend - ProjectID:', projectId, 'ResponsablesIDs:', Array.from(responsibleIds));
    return this.http.post<Project>(
        `${dev.apiUrl}${dev.apiVersion}projects/${projectId}/responsibles`,
        Array.from(responsibleIds)
    ).pipe(
        tap(response => console.log('Réponse du backend:', response))
    );
  }

  removeResponsiblesFromProject(projectId: number, responsibleIds: Set<number>) {
    return this.http.delete<Project>(
        `${dev.apiUrl}${dev.apiVersion}projects/${projectId}/responsibles`,
        { body: Array.from(responsibleIds) }
    );
  }

  getProjectResponsibles(projectId: number) {
    return this.http.get<Responsible[]>(
        `${dev.apiUrl}${dev.apiVersion}projects/${projectId}/responsibles`
    );
  }

  getProjectById(projectId: number): Observable<Project> {
    return this.http.get<Project>(
        `${dev.apiUrl}${dev.apiVersion}projects/${projectId}`
    );
  }
}
