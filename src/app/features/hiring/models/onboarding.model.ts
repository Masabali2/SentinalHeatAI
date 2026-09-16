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

export interface CandidateOnboarding {
  onboardingId?: number;
  email: string;
  phone: string | null;
  departmentId?: number | null;
  designationId?: number | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  departmentName: string | null;
  designationName: string | null;
  managerName: string | null;
  salary: number | null;
  joiningDate: string | null;
  employmentType: string | null;
  status: OnboardingStatus;
  offerStatus: number | null;
  offerExpiresAt: string | null;
  invitationExpiresAt: string | null;
  department?: { name?: string | null } | null;
  designation?: { name?: string | null } | null;
  manager?: { name?: string | null } | null;
}

export interface SubmitOnboardingRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  profilePicture: File | null;
  password: string;
}