import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';

import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { PermissionService } from '../../authorization/permission.service';
import { NAVIGATION_ITEMS } from '../../authorization/navigation.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  private readonly permissionService = inject(PermissionService);

  @Input() collapsed = false;

  @Input() mobileOpen = false;

  @Output() closeMobile = new EventEmitter<void>();
  @Output() collapseToggle = new EventEmitter<void>();  
  toggleSidebar(): void {
  this.collapseToggle.emit();
}

  readonly navigationItems =
    this.permissionService.filterNavigationItems(NAVIGATION_ITEMS);

  closeMobileMenu(): void {
    this.closeMobile.emit();
  }
}