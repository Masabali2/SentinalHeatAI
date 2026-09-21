export interface Designation {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  employeeCount: number;
}

export interface CreateDesignationRequest {
  name: string;
  code: string;
  description?: string | null;
}

export interface UpdateDesignationRequest {
  name: string;
  code: string;
  description?: string | null;
}