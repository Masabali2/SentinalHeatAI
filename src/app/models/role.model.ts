export interface Role {
  id: string;
  name: string;
}

export interface ChangeUserRoleRequest {
  role: string;
}
