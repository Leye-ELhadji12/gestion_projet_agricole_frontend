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

  // handleSaveResponsibles(responsibles: Responsible[]) {
  //   console.log('Responsables sélectionnés:', responsibles);
  //   this.showInviteModal.set(false);
  // }
  handleSaveResponsibles(responsibles: Responsible[]) {
    console.log('Responsables reçus du modal:', responsibles);
    const responsibleIds = new Set(responsibles.map(r => r.id!));
    console.log('IDs des responsables à envoyer:', Array.from(responsibleIds));

    this.isLoading.set(true);
    this.projectService.addResponsiblesToProject(this.project.id!, responsibleIds)
        .subscribe({
            next: (updatedProject) => {
                console.log('Réponse du backend:', updatedProject);
                // Effacer le cache pour forcer un rechargement
                this.cachedResponsibles.delete(this.project.id!);

                // Mettre à jour la liste des responsables avec les nouveaux
                const currentResponsibles = this.projectResponsibles();
                const newResponsibles = [...currentResponsibles, ...responsibles.filter(r =>
                    !currentResponsibles.some(cr => cr.id === r.id)
                )];
                this.projectResponsibles.set(newResponsibles);
                this.cachedResponsibles.set(this.project.id!, newResponsibles);

                // Fermer la modal
                this.showInviteModal.set(false);

                // Mettre à jour le projet parent si nécessaire
                this.project.responsibles = updatedProject.responsibles;
                this.responsiblesUpdated.emit();
            },
            error: (err) => {
                console.error('Erreur complète:', err);
                if (err.error) {
                    console.error('Détails de l\'erreur:', err.error);
                }
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
            },
            error: (err) => {
                console.error('Erreur chargement responsables', err);
            }
        });
  }

}
