import { Component, signal, Input, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  private router = inject(Router);

  @Input() isHidden = signal(false);

  isProjectsOrActivitiesRouteActive(): boolean {
    return this.router.url.startsWith('/projects-management/projects') || this.router.url.startsWith('/projects-management/project-activities');
  }

}
