export interface Permission {
  id: number;
  name: string;
  description: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
}

export interface UpdatePermissionRequest {
  name: string;
  description?: string;
}