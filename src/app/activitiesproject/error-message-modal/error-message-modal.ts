import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message-modal',
  imports: [CommonModule],
  templateUrl: './error-message-modal.html',
  styleUrl: './error-message-modal.css'
})
export class ErrorMessageModal {
  @Input() message: string = 'Une erreur est survenue.';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
