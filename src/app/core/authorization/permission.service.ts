import { Injectable, inject } from '@angular/core';

import { AuthStateService } from '../auth/auth-state.service';
import { NavigationItem } from './authorization.models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly authStateService = inject(AuthStateService);

  hasPermission(permission: string): boolean {
    return this.authStateService.hasPermission(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission =>
      this.hasPermission(permission)
    );
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission =>
      this.hasPermission(permission)
    );
  }

  filterNavigationItems(items: NavigationItem[]): NavigationItem[] {
    return items.filter(item =>
      !item.permission || this.hasPermission(item.permission)
    );
  }
}