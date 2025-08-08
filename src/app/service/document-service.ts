import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentDTO } from '../model/model';
import { dev } from '../../environment/develpment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private http = inject(HttpClient);

  uploadDocument(file: File, documentDTO: DocumentDTO): Observable<DocumentDTO> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('documentDTO', new Blob([JSON.stringify(documentDTO)], { type: 'application/json' }));
    return this.http.post<DocumentDTO>(`${dev.apiUrl}${dev.apiVersion}documents/upload`, formData);
  }

  getDocumentById(id: number): Observable<DocumentDTO> {
    return this.http.get<DocumentDTO>(`${dev.apiUrl}${dev.apiVersion}documents/${id}`);
  }

  // getAllDocuments(): Observable<DocumentDTO[]> {
  //   return this.http.get<DocumentDTO[]>(`${dev.apiUrl}${dev.apiVersion}documents`);
  // }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${dev.apiUrl}${dev.apiVersion}documents/${id}`);
  }

  getDocumentsByActivityId(activityId: number): Observable<DocumentDTO[]> {
    return this.http.get<DocumentDTO[]>(`${dev.apiUrl}${dev.apiVersion}documents/activity/${activityId}`);
  }

  currentActivityId = signal(0);
  private activityUrl = computed(() => {
    const activityId = this.currentActivityId();
    if (activityId === null) return '';
    return `${dev.apiUrl}${dev.apiVersion}documents/activity/${activityId}`;
  });

  private documentResource = httpResource<DocumentDTO[]>(this.activityUrl);

  documentList = computed(() => this.documentResource.value() ?? {} as DocumentDTO);


}
