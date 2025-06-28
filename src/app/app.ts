import { Component, signal, ViewChild } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { MainContent } from './main-content/main-content';

@Component({
  selector: 'app-root',
  imports: [
    Sidebar,
    Header,
    MainContent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'project-management-app';
  isSidebarHidden = signal(false);

  @ViewChild(MainContent) mainContent!: MainContent;

  onToggleSidebar() {
    this.isSidebarHidden.update((value) => !value);
  }

  onViewChanged(view: string) {
    this.mainContent.changeView(view);
  }
}
