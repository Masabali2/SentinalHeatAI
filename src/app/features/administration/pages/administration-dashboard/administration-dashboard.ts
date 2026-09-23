import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

import { RoleService } from '../../../../core/services/role.service';
import { PermissionService } from '../../../../core/services/permission.service';
import { AdministrationStatCard } from '../../components/administration-stat-card/administration-stat-card';
import { AdministrationCard } from '../../components/administration-card/administration-card';

@Component({
  selector: 'app-administration-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    AdministrationStatCard,
     AdministrationCard
  ],
  templateUrl: './administration-dashboard.html',
  styleUrl: './administration-dashboard.css'
})
export class AdministrationDashboard {
  private readonly roleService = inject(RoleService);
  private readonly permissionService = inject(PermissionService);

  readonly totalRoles = signal(0);
  readonly totalPermissions = signal(0);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      roles: this.roleService.getAll(),
      permissions: this.permissionService.getAll()
    }).subscribe({
      next: response => {
        this.totalRoles.set(response.roles.data?.length ?? 0);
        this.totalPermissions.set(response.permissions.data?.length ?? 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Unable to load administration statistics.'
        );
        this.isLoading.set(false);
      }
    });
  }
}