import { Component, inject, signal } from '@angular/core';
import { UserService } from '../service/user-service';
import { CommonModule } from '@angular/common';
import { Responsible } from '../model/model';
import { UserFormModal } from './user-form-modal/user-form-modal';
import { setErrorMessage } from '../errorMessage/message';
import { ConfirmationModal } from '../projects/confirmation-modal/confirmation-modal';
import { ErrorMessageModal } from '../projects/error-message-modal/error-message-modal';

@Component({
  selector: 'app-users',
  imports: [CommonModule, UserFormModal, ConfirmationModal, ErrorMessageModal],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {

  private userService = inject(UserService);

  isLoading = this.userService.isLoading;
  errorMessage = this.userService.errorMessage;
  responsibles = this.userService.responsibles;
  totalElements = this.userService.totalElements;
  totalPages = this.userService.totalPages;
  currentPage = this.userService.currentPage;
  pageSize = this.userService.pageSize;

  showUserFormModal = signal(false);
  userToEdit = signal<Responsible | null>(null);
  userToDelete = signal<Responsible | null>(null);
  showConfirmationModal = signal(false);
  deletionErrorMessage = signal<string | null>(null);
  showErrorMessageModal = signal(false);

  openCreateUserModal() {
    this.userToEdit.set(null);
    this.showUserFormModal.set(true);
  }

  closeUserFormModal() {
    this.showUserFormModal.set(false);
    this.userToEdit.set(null);
  }

  handleSaveUser(user: Responsible) {
    if (this.userToEdit()) {
      this.userService.updateUser(user).subscribe({
        next: () => {
          this.userService.loadPageResponsibles(this.currentPage());
          this.closeUserFormModal();
        },
        error: (err) => {
          this.deletionErrorMessage.set(setErrorMessage(err, 'User'));
          this.showErrorMessageModal.set(true);
        }
      });
    } else {
      this.userService.createUser(user).subscribe({
        next: () => {
          this.userService.loadPageResponsibles(this.currentPage());
          this.closeUserFormModal();
        },
        error: (err) => {
          this.deletionErrorMessage.set(setErrorMessage(err, 'User'));
          this.showErrorMessageModal.set(true);
        }
      });
    }
  }

  editUser(user: Responsible) {
    this.userToEdit.set(user);
    this.showUserFormModal.set(true);
  }

  openDeleteUserConfirmation(user: Responsible) {
    this.userToDelete.set(user);
    this.showConfirmationModal.set(true);
  }

  closeConfirmationModal() {
    this.showConfirmationModal.set(false);
    this.userToDelete.set(null);
  }

  handleConfirmDeleteUser() {
    const user = this.userToDelete();
    if (user && user.id !== undefined) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.userService.loadPageResponsibles(this.currentPage());
          this.closeConfirmationModal();
        },
        error: (err) => {
          this.deletionErrorMessage.set(setErrorMessage(err, 'User'));
          this.showErrorMessageModal.set(true);
          this.closeConfirmationModal();
        }
      });
    }
  }

  closeErrorMessageModal() {
    this.showErrorMessageModal.set(false);
    this.deletionErrorMessage.set(null);
  }

  goToPageResponsibles(page: number) {
    this.userService.loadPageResponsibles(page);
  }

  previousPageResponsibles() {
    if (this.currentPage() > 0) {
      this.goToPageResponsibles(this.currentPage() - 1);
    }
  }

  nextPageResponsibles() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.goToPageResponsibles(this.currentPage() + 1);
    }
  }

  getInitials(firstname: string, lastname: string): string {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  }

  getRoleOutlineClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-400 dark:bg-red-900 dark:text-red-300 dark:border-red-700';
      case 'VISITOR':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-400 dark:bg-green-900 dark:text-green-300 dark:border-green-700';
      default:
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500';
    }
  }
}
