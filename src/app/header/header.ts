import { Component, signal, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() isSidebarHidden = signal(false);
  @Input() onToggleSidebar!: () => void;
}