import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { forkJoin } from 'rxjs';

import { PermissionService } from '../../../../core/services/permission.service';
import { RoleService } from '../../../../core/services/role.service';

import { Permission } from '../../../../models/permission.model';
import { Role } from '../../../../models/role.model';
import { UpdateRolePermissionsRequest } from '../../../../models/role-permission.model';

import {
  PermissionFilter,
  PermissionFilterValue
} from '../permission-filter/permission-filter';

interface PermissionMatrixRow {
  permission: Permission;
  groupName: string;
}

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [
    PermissionFilter
  ],
  templateUrl: './permission-matrix.html',
  styleUrl: './permission-matrix.css'
})
export class PermissionMatrix implements OnInit {
  private readonly permissionService = inject(PermissionService);
  private readonly roleService = inject(RoleService);

  readonly roles = signal<Role[]>([]);

  readonly permissions = signal<PermissionMatrixRow[]>([]);

  readonly permissionGroups = signal<string[]>([]);

  readonly rolePermissionMap =
    signal<Map<string, Set<number>>>(new Map());

  readonly filter = signal<PermissionFilterValue>({
    searchTerm: '',
    groupName: ''
  });

  readonly filteredPermissions = computed(() => {
    const currentFilter = this.filter();
    const searchTerm = currentFilter.searchTerm.toLowerCase();

    return this.permissions().filter(row => {
      const matchesGroup =
        !currentFilter.groupName ||
        row.groupName === currentFilter.groupName;

      const matchesSearch =
        !searchTerm ||
        row.permission.name.toLowerCase().includes(searchTerm) ||
        row.permission.description
          .toLowerCase()
          .includes(searchTerm);

      return matchesGroup && matchesSearch;
    });
  });

  readonly filteredPermissionGroups = computed(() =>
    Array.from(
      new Set(
        this.filteredPermissions().map(row => row.groupName)
      )
    ).sort(
      (first, second) => first.localeCompare(second)
    )
  );

  readonly isLoading = signal(false);

  readonly isSaving = signal(false);

  readonly errorMessage = signal('');

  readonly successMessage = signal('');

  private originalRolePermissionMap =
    new Map<string, Set<number>>();

  ngOnInit(): void {
    this.loadMatrix();
  }

  private loadMatrix(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    forkJoin({
      roles: this.roleService.getAll(),
      permissions: this.permissionService.getAll()
    }).subscribe({
      next: response => {
        const roles = response.roles.data ?? [];
        const permissions = response.permissions.data ?? [];

        this.roles.set(roles);

        const matrixRows = permissions.map(permission => ({
          permission,
          groupName: this.getPermissionGroupName(
            permission.name
          )
        }));

        this.permissions.set(matrixRows);

        this.permissionGroups.set(
          this.getPermissionGroups(matrixRows)
        );

        this.loadRolePermissions(roles);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load access control data.'
        );

        this.isLoading.set(false);
      }
    });
  }

  private loadRolePermissions(roles: Role[]): void {
    if (roles.length === 0) {
      this.rolePermissionMap.set(new Map());
      this.originalRolePermissionMap = new Map();
      this.isLoading.set(false);
      return;
    }

    const requests = roles.map(role =>
      this.roleService.getPermissions(role.id)
    );

    forkJoin(requests).subscribe({
      next: responses => {
        const permissionMap =
          new Map<string, Set<number>>();

        roles.forEach((role, index) => {
          const permissions =
            responses[index].data ?? [];

          permissionMap.set(
            role.id,
            new Set(
              permissions.map(
                permission => permission.id
              )
            )
          );
        });

        this.rolePermissionMap.set(permissionMap);

        this.originalRolePermissionMap =
          this.clonePermissionMap(permissionMap);

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load role permissions.'
        );

        this.isLoading.set(false);
      }
    });
  }

  onFilterChanged(
    filter: PermissionFilterValue
  ): void {
    this.filter.set(filter);
  }

  isPermissionAssigned(
    roleId: string,
    permissionId: number
  ): boolean {
    return (
      this.rolePermissionMap()
        .get(roleId)
        ?.has(permissionId) ?? false
    );
  }

  togglePermission(
    roleId: string,
    permissionId: number
  ): void {
    const currentMap =
      this.clonePermissionMap(
        this.rolePermissionMap()
      );

    const rolePermissions =
      currentMap.get(roleId) ??
      new Set<number>();

    if (rolePermissions.has(permissionId)) {
      rolePermissions.delete(permissionId);
    } else {
      rolePermissions.add(permissionId);
    }

    currentMap.set(
      roleId,
      rolePermissions
    );

    this.rolePermissionMap.set(
      currentMap
    );

    this.successMessage.set('');
    this.errorMessage.set('');
  }

  saveChanges(): void {
    if (this.isSaving()) {
      return;
    }

    const changedRoles =
      this.getChangedRoles();

    if (changedRoles.length === 0) {
      this.successMessage.set(
        'No permission changes to save.'
      );

      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const requests = changedRoles.map(roleId => {
      const permissionIds =
        Array.from(
          this.rolePermissionMap()
            .get(roleId) ?? []
        ).sort(
          (first, second) => first - second
        );

      const request:
        UpdateRolePermissionsRequest = {
          permissionIds
        };

      return this.roleService.updatePermissions(
        roleId,
        request
      );
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.originalRolePermissionMap =
          this.clonePermissionMap(
            this.rolePermissionMap()
          );

        this.isSaving.set(false);

        this.successMessage.set(
          'Permissions updated successfully.'
        );
      },

      error: () => {
        this.isSaving.set(false);

        this.errorMessage.set(
          'Unable to update permissions. Please try again.'
        );
      }
    });
  }

  private getChangedRoles(): string[] {
    const currentMap =
      this.rolePermissionMap();

    const roleIds = new Set([
      ...this.originalRolePermissionMap.keys(),
      ...currentMap.keys()
    ]);

    return Array.from(roleIds).filter(
      roleId =>
        !this.arePermissionSetsEqual(
          this.originalRolePermissionMap
            .get(roleId) ??
            new Set<number>(),

          currentMap.get(roleId) ??
            new Set<number>()
        )
    );
  }

  private arePermissionSetsEqual(
    first: Set<number>,
    second: Set<number>
  ): boolean {
    if (first.size !== second.size) {
      return false;
    }

    for (const permissionId of first) {
      if (!second.has(permissionId)) {
        return false;
      }
    }

    return true;
  }

  private clonePermissionMap(
    source: Map<string, Set<number>>
  ): Map<string, Set<number>> {
    return new Map(
      Array.from(
        source.entries()
      ).map(
        ([roleId, permissionIds]) => [
          roleId,
          new Set(permissionIds)
        ]
      )
    );
  }

  private getPermissionGroupName(
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

  private getPermissionGroups(
    rows: PermissionMatrixRow[]
  ): string[] {
    return Array.from(
      new Set(
        rows.map(row => row.groupName)
      )
    ).sort(
      (first, second) =>
        first.localeCompare(second)
    );
  }

  getPermissionsForGroup(
    groupName: string
  ): PermissionMatrixRow[] {
    return this.filteredPermissions().filter(
      row => row.groupName === groupName
    );
  }
}