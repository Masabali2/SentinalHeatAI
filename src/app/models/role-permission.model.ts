import { Permission } from './permission.model';

export interface RolePermission {
  roleId: string;
  permissionId: number;
  permission?: Permission;
}
export interface UpdateRolePermissionsRequest {
  permissionIds: number[];
}