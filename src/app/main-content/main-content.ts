import { Component, Input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-content',
  imports: [ RouterOutlet ],
  templateUrl: './main-content.html',
  styleUrl: './main-content.css'
})
export class MainContent {
  currentView = signal<string>('dashboard');
  @Input() isSidebarHidden =  signal(false);

  changeView(view: string) {
    this.currentView.set(view);
  }
}
