import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Project, Responsible } from '../../model/model';

registerLocaleData(localeFr);

@Component({
  selector: 'app-detail-project',
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './detail-project.html',
  styleUrl: './detail-project.css'
})
export class DetailProject {
  @Input({ required: true }) project!: Project;
  @Output() closeModalDetail = new EventEmitter<void>();

  closeModal() {
    this.closeModalDetail.emit();
  }

  getInitials(responsible: Responsible): string {
    if (!responsible.firstname && !responsible.lastname) return 'NN';
    const firstInitial = responsible.firstname ? String(responsible.firstname).charAt(0) : '';
    const lastInitial = responsible.lastname ? String(responsible.lastname).charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  inviteStakeholders() {
    console.log('Invite stakeholders for project:', this.project.name);
  }
}
