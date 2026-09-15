export interface Designation {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  employeeCount: number;
}