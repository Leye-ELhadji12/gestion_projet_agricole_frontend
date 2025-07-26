import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { dev } from '../../environment/develpment';
import { Responsible, ResponsibleResponse } from '../model/model';
import { setErrorMessage } from '../errorMessage/message';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);

  currentPage = signal(0);
  pageSize = signal(15);

  private responsiblesUrl = computed(() => {
    const page = this.currentPage();
    const size = this.pageSize();
    return `${dev.apiUrl}${dev.apiVersion}responsibles?page=${page}&size=${size}`;
  });

  private responsiblesResource = httpResource<ResponsibleResponse>(this.responsiblesUrl);

  responsibles = computed(() => this.responsiblesResource.value()?.content ?? [] as Responsible[]);
  totalElements = computed(() => this.responsiblesResource.value()?.totalElements ?? 0);
  totalPages = computed(() => this.responsiblesResource.value()?.totalPages ?? 0);
  error = computed(() => this.responsiblesResource.error() as HttpErrorResponse);
  errorMessage = computed(() => setErrorMessage(this.error(), 'User'));
  isLoading = this.responsiblesResource.isLoading;

  loadPageResponsibles(page: number) {
    this.currentPage.set(page);
  }

  createUser(user: Responsible): Observable<Responsible> {
    return this.http.post<Responsible>(`${dev.apiUrl}${dev.apiVersion}responsibles/create`, user);
  }

  updateUser(user: Responsible): Observable<Responsible> {
    return this.http.patch<Responsible>(`${dev.apiUrl}${dev.apiVersion}responsibles/update/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${dev.apiUrl}${dev.apiVersion}responsibles/delete/${id}`);
  }

}
