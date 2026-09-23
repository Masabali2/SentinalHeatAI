import {
  Component,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { PermissionService } from '../../../../core/services/permission.service';

import {
  CreatePermissionRequest,
  Permission,
  UpdatePermissionRequest
} from '../../../../models/permission.model';

import { PermissionForm } from '../../components/permission-form/permission-form';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    RouterLink,
    PermissionForm
  ],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css'
})
export class Permissions {
  private readonly permissionService =
    inject(PermissionService);

  readonly permissions =
    signal<Permission[]>([]);

  readonly isLoading =
    signal(false);

  readonly isSubmitting =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly successMessage =
    signal('');

  readonly isFormVisible =
    signal(false);

  readonly editingPermission =
    signal<Permission | null>(null);

  constructor() {
    this.loadPermissions();
  }

  private loadPermissions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.permissionService.getAll().subscribe({
      next: response => {
        this.permissions.set(
          response.data ?? []
        );

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load permissions.'
        );

        this.isLoading.set(false);
      }
    });
  }

  startCreating(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    this.editingPermission.set(null);
    this.isFormVisible.set(true);
  }

  startEditing(permission: Permission): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    this.editingPermission.set(permission);
    this.isFormVisible.set(true);
  }

  cancelForm(): void {
    this.isFormVisible.set(false);
    this.editingPermission.set(null);
    this.errorMessage.set('');
  }

  savePermission(
    request:
      | CreatePermissionRequest
      | UpdatePermissionRequest
  ): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const currentPermission =
      this.editingPermission();

    if (currentPermission) {
      this.updatePermission(
        currentPermission.id,
        request as UpdatePermissionRequest
      );

      return;
    }

    this.createPermission(
      request as CreatePermissionRequest
    );
  }

  private createPermission(
    request: CreatePermissionRequest
  ): void {
    this.permissionService
      .create(request)
      .subscribe({
        next: response => {
          const createdPermission =
            response.data;

          if (createdPermission) {
            this.permissions.update(
              permissions => [
                ...permissions,
                createdPermission
              ]
            );
          }

          this.isSubmitting.set(false);
          this.isFormVisible.set(false);

          this.successMessage.set(
            'Permission created successfully.'
          );
        },

        error: () => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            'Unable to create permission.'
          );
        }
      });
  }

  private updatePermission(
    permissionId: number,
    request: UpdatePermissionRequest
  ): void {
    this.permissionService
      .update(
        permissionId,
        request
      )
      .subscribe({
        next: response => {
          const updatedPermission =
            response.data;

          if (updatedPermission) {
            this.permissions.update(
              permissions =>
                permissions.map(permission =>
                  permission.id === permissionId
                    ? updatedPermission
                    : permission
                )
            );
          }

          this.isSubmitting.set(false);
          this.isFormVisible.set(false);
          this.editingPermission.set(null);

          this.successMessage.set(
            'Permission updated successfully.'
          );
        },

        error: () => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            'Unable to update permission.'
          );
        }
      });
  }

  deletePermission(
    permission: Permission
  ): void {
    const confirmed = window.confirm(
      `Delete permission "${permission.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.permissionService
      .delete(permission.id)
      .subscribe({
        next: () => {
          this.permissions.update(
            permissions =>
              permissions.filter(
                current =>
                  current.id !== permission.id
              )
          );

          this.successMessage.set(
            'Permission deleted successfully.'
          );
        },

        error: () => {
          this.errorMessage.set(
            'Unable to delete permission. It may still be assigned to a role.'
          );
        }
      });
  }

  getPermissionGroup(
    permissionName: string
  ): string {
    const separatorIndex =
      permissionName.indexOf('.');

    if (separatorIndex === -1) {
      return permissionName;
    }

    return permissionName.substring(
      0,
      separatorIndex
    );
  }

  getPermissionGroups(): string[] {
    return Array.from(
      new Set(
        this.permissions().map(
          permission =>
            this.getPermissionGroup(
              permission.name
            )
        )
      )
    ).sort(
      (first, second) =>
        first.localeCompare(second)
    );
  }

  getPermissionsForGroup(
    groupName: string
  ): Permission[] {
    return this.permissions()
      .filter(
        permission =>
          this.getPermissionGroup(
            permission.name
          ) === groupName
      )
      .sort(
        (first, second) =>
          first.name.localeCompare(second.name)
      );
  }
}