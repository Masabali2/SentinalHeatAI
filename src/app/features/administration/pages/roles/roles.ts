import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RoleService } from '../../../../core/services/role.service';
import { Role } from '../../../../models/role.model';
import { RoleCard } from '../../components/role-card/role-card';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [RouterLink , RoleCard],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles {
  private readonly roleService = inject(RoleService);

  readonly roles = signal<Role[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  constructor() {
    this.loadRoles();
  }

  private loadRoles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.roleService.getAll().subscribe({
      next: response => {
        this.roles.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to load roles.');
        this.isLoading.set(false);
      }
    });
  }
}