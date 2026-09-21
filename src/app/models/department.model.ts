export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  employeeCount: number;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string | null;
}

export interface UpdateDepartmentRequest {
  name: string;
  code: string;
  description?: string | null;
}