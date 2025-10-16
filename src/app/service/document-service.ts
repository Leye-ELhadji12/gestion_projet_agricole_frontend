import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliverableDTO } from '../model/model';
import { dev } from '../../environment/develpment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private http = inject(HttpClient);

  uploadDocument(file: File, documentDTO: DeliverableDTO): Observable<DeliverableDTO> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('documentDTO', new Blob([JSON.stringify(documentDTO)], { type: 'application/json' }));
    return this.http.post<DeliverableDTO>(`${dev.apiUrl}${dev.apiVersion}documents/upload`, formData);
  }

  getDocumentById(id: number): Observable<DeliverableDTO> {
    return this.http.get<DeliverableDTO>(`${dev.apiUrl}${dev.apiVersion}documents/${id}`);
  }

  // getAllDocuments(): Observable<DocumentDTO[]> {
  //   return this.http.get<DocumentDTO[]>(`${dev.apiUrl}${dev.apiVersion}documents`);
  // }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${dev.apiUrl}${dev.apiVersion}documents/${id}`);
  }

  getDocumentsByActivityId(activityId: number): Observable<DeliverableDTO[]> {
    return this.http.get<DeliverableDTO[]>(`${dev.apiUrl}${dev.apiVersion}documents/activity/${activityId}`);
  }

  currentActivityId = signal<number | null>(null);
  private documentUrl = computed(() => {
    const activityId = this.currentActivityId();
    if (activityId === null) return '';
    return `${dev.apiUrl}${dev.apiVersion}documents/activity/${activityId}`;
  });

  private documentResource = httpResource<DeliverableDTO[]>(this.documentUrl);

  documentList = computed(() => this.documentResource.value() ?? ([] as DeliverableDTO[]));

  refreshDocuments() {
    this.documentResource.reload();
  }

}
