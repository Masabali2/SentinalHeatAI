import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { forkJoin } from 'rxjs';

import { RoleService } from '../../../../core/services/role.service';
import { PermissionService } from '../../../../core/services/permission.service';

import {
  Role,
  UpdateRoleRequest
} from '../../../../models/role.model';

import { Permission } from '../../../../models/permission.model';

import { UpdateRolePermissionsRequest } from '../../../../models/role-permission.model';

import { RoleForm } from '../../components/role-form/role-form';

interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-details',
  standalone: true,
  imports: [
    RouterLink,
    RoleForm
  ],
  templateUrl: './role-details.html',
  styleUrl: './role-details.css'
})
export class RoleDetails {
  private readonly route = inject(ActivatedRoute);

  private readonly roleService =
    inject(RoleService);

  private readonly permissionService =
    inject(PermissionService);

  readonly role =
    signal<Role | null>(null);

  readonly permissions =
    signal<Permission[]>([]);

  readonly selectedPermissionIds =
    signal<Set<number>>(
      new Set<number>()
    );

  readonly permissionGroups =
    signal<PermissionGroup[]>([]);

  readonly isLoading =
    signal(false);

  readonly isLoadingPermissions =
    signal(false);

  readonly isEditing =
    signal(false);

  readonly isManagingPermissions =
    signal(false);

  readonly isSubmitting =
    signal(false);

  readonly isSavingPermissions =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly permissionErrorMessage =
    signal('');

  readonly successMessage =
    signal('');

  private originalPermissionIds =
    new Set<number>();

  constructor() {
    this.loadRole();
  }

  private loadRole(): void {
    const roleId =
      this.route.snapshot.paramMap.get(
        'roleId'
      );

    if (!roleId) {
      this.errorMessage.set(
        'Role ID is missing.'
      );

      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.roleService
      .getById(roleId)
      .subscribe({
        next: response => {
          const role =
            response.data ?? null;

          this.role.set(role);
          this.isLoading.set(false);

          if (role) {
            this.loadRolePermissions(
              role.id
            );
          }
        },

        error: () => {
          this.errorMessage.set(
            'Unable to load role.'
          );

          this.isLoading.set(false);
        }
      });
  }

  private loadRolePermissions(
    roleId: string
  ): void {
    this.isLoadingPermissions.set(true);

    this.permissionErrorMessage.set('');

    forkJoin({
      allPermissions:
        this.permissionService.getAll(),

      rolePermissions:
        this.roleService.getPermissions(
          roleId
        )
    }).subscribe({
      next: response => {
        const allPermissions =
          response.allPermissions.data ?? [];

        const rolePermissions =
          response.rolePermissions.data ?? [];

        const assignedPermissionIds =
          new Set(
            rolePermissions.map(
              permission =>
                permission.id
            )
          );

        this.permissions.set(
          allPermissions
        );

        this.selectedPermissionIds.set(
          new Set(
            assignedPermissionIds
          )
        );

        this.originalPermissionIds =
          new Set(
            assignedPermissionIds
          );

        this.permissionGroups.set(
          this.groupPermissions(
            allPermissions
          )
        );

        this.isLoadingPermissions.set(
          false
        );
      },

      error: () => {
        this.permissionErrorMessage.set(
          'Unable to load role permissions.'
        );

        this.isLoadingPermissions.set(
          false
        );
      }
    });
  }

  startEditing(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.errorMessage.set('');
    this.isEditing.set(false);
  }

  updateRole(
    request: UpdateRoleRequest
  ): void {
    const currentRole =
      this.role();

    if (!currentRole) {
      return;
    }

    this.isSubmitting.set(true);

    this.errorMessage.set('');
    this.successMessage.set('');

    this.roleService
      .update(
        currentRole.id,
        request
      )
      .subscribe({
        next: response => {
          this.role.set(
            response.data ??
            currentRole
          );

          this.isSubmitting.set(false);
          this.isEditing.set(false);

          this.successMessage.set(
            'Role updated successfully.'
          );
        },

        error: () => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            'Unable to update role.'
          );
        }
      });
  }

  startManagingPermissions(): void {
    this.permissionErrorMessage.set('');
    this.successMessage.set('');

    this.isManagingPermissions.set(
      true
    );
  }

  cancelManagingPermissions(): void {
    this.selectedPermissionIds.set(
      new Set(
        this.originalPermissionIds
      )
    );

    this.permissionErrorMessage.set('');

    this.isManagingPermissions.set(
      false
    );
  }

  isPermissionAssigned(
    permissionId: number
  ): boolean {
    return this.selectedPermissionIds()
      .has(permissionId);
  }

  togglePermission(
    permissionId: number
  ): void {
    const currentIds =
      new Set(
        this.selectedPermissionIds()
      );

    if (
      currentIds.has(permissionId)
    ) {
      currentIds.delete(
        permissionId
      );
    } else {
      currentIds.add(
        permissionId
      );
    }

    this.selectedPermissionIds.set(
      currentIds
    );

    this.successMessage.set('');

    this.permissionErrorMessage.set('');
  }

  savePermissions(): void {
    const currentRole =
      this.role();

    if (
      !currentRole ||
      this.isSavingPermissions()
    ) {
      return;
    }

    const permissionIds =
      Array.from(
        this.selectedPermissionIds()
      ).sort(
        (first, second) =>
          first - second
      );

    const request:
      UpdateRolePermissionsRequest = {
        permissionIds
      };

    this.isSavingPermissions.set(
      true
    );

    this.permissionErrorMessage.set('');
    this.successMessage.set('');

    this.roleService
      .updatePermissions(
        currentRole.id,
        request
      )
      .subscribe({
        next: () => {
          this.originalPermissionIds =
            new Set(
              permissionIds
            );

          this.isSavingPermissions.set(
            false
          );

          this.isManagingPermissions.set(
            false
          );

          this.successMessage.set(
            'Role permissions updated successfully.'
          );
        },

        error: () => {
          this.isSavingPermissions.set(
            false
          );

          this.permissionErrorMessage.set(
            'Unable to update role permissions. Please try again.'
          );
        }
      });
  }

  private groupPermissions(
    permissions: Permission[]
  ): PermissionGroup[] {
    const groups =
      new Map<
        string,
        Permission[]
      >();

    for (
      const permission of permissions
    ) {
      const groupName =
        this.getPermissionGroupName(
          permission.name
        );

      const group =
        groups.get(groupName) ??
        [];

      group.push(permission);

      groups.set(
        groupName,
        group
      );
    }

    return Array.from(
      groups.entries()
    )
      .sort(
        ([first], [second]) =>
          first.localeCompare(second)
      )
      .map(
        ([name, groupPermissions]) => ({
          name,

          permissions:
            groupPermissions.sort(
              (first, second) =>
                first.name.localeCompare(
                  second.name
                )
            )
        })
      );
  }

  private getPermissionGroupName(
    permissionName: string
  ): string {
    const separatorIndex =
      permissionName.indexOf('.');

    if (
      separatorIndex === -1
    ) {
      return permissionName;
    }

    return permissionName.substring(
      0,
      separatorIndex
    );
  }
}