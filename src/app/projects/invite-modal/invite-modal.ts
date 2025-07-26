import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { Responsible } from '../../model/model';
import { UserService } from '../../service/user-service';

@Component({
  selector: 'app-invite-modal',
  templateUrl: './invite-modal.html',
  styleUrls: ['./invite-modal.css']
})
export class InviteModal {
  private userService = inject(UserService);

  @Input() projectId!: number;
  @Output() closeModal = new EventEmitter<void>();
  @Output() save = new EventEmitter<Responsible[]>();

  selectedResponsibles = signal<Responsible[]>([]);
  allResponsibles = this.userService.responsibles();

  isSelected(responsible: Responsible): boolean {
    return this.selectedResponsibles().some(r => r.id === responsible.id);
  }

  toggleResponsible(responsible: Responsible) {
    const current = this.selectedResponsibles();
    const exists = current.some(r => r.id === responsible.id);
    
    if (exists) {
      this.selectedResponsibles.set(current.filter(r => r.id !== responsible.id));
    } else {
      this.selectedResponsibles.set([...current, {...responsible}]);
    }
  }

  onSave() {
    this.save.emit(this.selectedResponsibles());
    this.closeModal.emit();
  }

  onClose() {
    this.closeModal.emit();
  }
}
