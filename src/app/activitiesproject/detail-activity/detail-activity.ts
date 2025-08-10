import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { Activity, DocumentType, DocumentDTO } from '../../model/model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../service/document-service';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-detail-activity',
  imports: [CommonModule, FormsModule],
  templateUrl: './detail-activity.html',
  styleUrl: './detail-activity.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailActivity {

  private _activity: Activity | null = null;

  @Input()
  set activity(value: Activity | null) {
    this._activity = value;
    if (value?.id) {
      this.documentService.currentActivityId.set(value.id);
    }
  }

  get activity(): Activity | null {
    return this._activity;
  }

  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  documentTypes = Object.values(DocumentType);
  selectedFile: File | null = null;
  selectedDocumentType = signal<DocumentType | null>(null);
  selectedActivity = signal<Activity | null>(null);

  private documentService = inject(DocumentService);
  private cdr = inject(ChangeDetectorRef);

  livrables = this.documentService.documentList;

  onClose() {
    this.closeModal.emit();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
      console.log("Fichier sélectionné :", this.selectedFile.name);
    }
  }

  onDocumentTypeSelected(event: Event) {
    const selectedType = (event.target as HTMLSelectElement).value as DocumentType;
    this.selectedDocumentType.set(selectedType);
    console.log("Type de document sélectionné :", this.selectedDocumentType);
  }

  uploadDocument() {
    if (this.selectedFile && this.selectedDocumentType && this.activity?.id) {
      const documentDTO: DocumentDTO = {
        type: this.selectedDocumentType()!,
        originalFileName: this.selectedFile.name,
        fileType: this.selectedFile.type,
        fileSize: this.selectedFile.size,
        activityId: this.activity.id
      };
      console.log('les donnees :', documentDTO);

      this.documentService.uploadDocument(this.selectedFile, documentDTO).subscribe({
        next: (response) => {
          console.log('Document uploaded successfully:', response);
          this.selectedFile = null;
          this.selectedDocumentType.set(null);
          this.documentService.refreshDocuments();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error uploading document:', error);
        }
      });
    } else {
      console.warn('Please select a file, a document type, and ensure an activity is selected.');
    }
  }
}
