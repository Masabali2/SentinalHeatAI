export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salary: number;
  dateOfBirth: string | null;
  dateOfJoining: string | null;
  isActive: boolean;
  profilePictureUrl: string | null;

  departmentId: number;
  departmentName: string;

  designationId: number;
  designationName: string;

  managerId: number | null;
  managerName: string | null;

  userId: string | null;
  role: string | null;
}