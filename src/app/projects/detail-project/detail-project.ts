import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { Project, Responsible } from '../../model/model';
import { InviteModal } from '../invite-modal/invite-modal';
import { UserService } from '../../service/user-service';
import { ProjectsService } from '../../service/projects-service';
import { Observable } from 'rxjs';

registerLocaleData(localeFr);

@Component({
  selector: 'app-detail-project',
  imports: [CommonModule, CurrencyPipe, DatePipe, InviteModal],
  templateUrl: './detail-project.html',
  styleUrl: './detail-project.css'
})
export class DetailProject implements OnInit {

  private userService = inject(UserService);
  private projectService = inject(ProjectsService);

  @Input({ required: true }) project!: Project;
  @Output() closeModalDetail = new EventEmitter<void>();
  @Output() responsiblesUpdated = new EventEmitter<void>();

  showInviteModal = signal(false);
  isLoading = signal(false);
  projectResponsibles = signal<Responsible[]>([]);
  private cachedResponsibles = new Map<number, Responsible[]>();

  ngOnInit() {
    this.preloadResponsibles();
    this.loadProjectResponsibles();
  }

  private preloadResponsibles() {
    this.isLoading.set(true);
    this.userService.loadPageResponsibles(0);
    this.isLoading.set(false);
  }

  closeModal() {
    this.closeModalDetail.emit();
  }

  getInitials(responsible: Responsible) {
    if (!responsible.firstname && !responsible.lastname) return 'NN';
    const firstInitial = responsible.firstname ? String(responsible.firstname).charAt(0) : '';
    const lastInitial = responsible.lastname ? String(responsible.lastname).charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  inviteStakeholders() {
    this.showInviteModal.set(true);
  }

  handleSaveResponsibles(responsibles: Responsible[]) {
    const responsibleIds = new Set(responsibles.map(r => r.id!));
    this.isLoading.set(true);
    this.projectService.addResponsiblesToProject(this.project.id!, responsibleIds)
        .subscribe({
            next: (updatedProject) => {
                this.cachedResponsibles.delete(this.project.id!);
                const currentResponsibles = this.projectResponsibles();
                const newResponsibles = [...currentResponsibles, ...responsibles.filter(r =>
                    !currentResponsibles.some(cr => cr.id === r.id)
                )];
                this.projectResponsibles.set(newResponsibles);
                this.cachedResponsibles.set(this.project.id!, newResponsibles);
                this.showInviteModal.set(false);
                this.project.responsibles = updatedProject.responsibles;
                this.responsiblesUpdated.emit();
            },
            complete: () => this.isLoading.set(false)
        });
  }

  private loadProjectResponsibles() {
    if (this.cachedResponsibles.has(this.project.id!)) {
        this.projectResponsibles.set(this.cachedResponsibles.get(this.project.id!)!);
        return;
    }
    this.projectService.getProjectResponsibles(this.project.id!)
      .subscribe({
        next: (responsibles) => {
          this.cachedResponsibles.set(this.project.id!, responsibles);
          this.projectResponsibles.set(responsibles);
        }
      });
  }

}
