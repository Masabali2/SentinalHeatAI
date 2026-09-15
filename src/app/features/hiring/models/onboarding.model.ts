export interface CreateOnboardingRequest {
  email: string;
  phone: string | null;
  departmentId: number | null;
  designationId: number | null;
  salary: number | null;
  joiningDate: string | null;
  employmentType: string | null;
  managerId: number | null;
  hiringBatchId: number | null;
}
export interface Onboarding {
  id: number;

  email: string;
  phone: string | null;

  departmentId: number | null;
  departmentName: string | null;

  designationId: number | null;
  designationName: string | null;

  salary: number | null;
  joiningDate: string | null;
  employmentType: string | null;

  managerId: number | null;
  managerName: string | null;

  status: OnboardingStatus;

  userId: string | null;
  employeeId: number | null;
  hiringBatchId: number | null;

  createdAt: string;
  completedAt: string | null;
}
export enum OnboardingStatus {
  Created = 1,
  OfferPending = 2,
  OfferAccepted = 3,
  ProfileIncomplete = 4,
  ProfileSubmitted = 5,
  ValidationFailed = 6,
  EmailVerificationPending = 7,
  EmailVerified = 8,
  Completed = 9,
  Cancelled = 10
}
export interface OnboardingInProgress {
  id: number;
  email: string;
  phone: string | null;
  departmentName: string | null;
  designationName: string | null;
  status: OnboardingStatus;
  createdAt: string;
}
export interface UpdateOnboardingRequest {
  departmentId: number | null;
  designationId: number | null;
  salary: number | null;
  joiningDate: string | null;
  employmentType: string | null;
  managerId: number | null;
}