export enum OfferStatus {
  Draft = 1,
  Sent = 2,
  Viewed = 3,
  Accepted = 4,
  Declined = 5,
  Expired = 6,
  Cancelled = 7
}

export interface CreateOfferRequest {
  employeeOnboardingId: number;
  expiresAt: string | null;
}

export interface Offer {
  id: number;
  employeeOnboardingId: number;

  salary: number;

  departmentId: number | null;
  designationId: number | null;

  employmentType: string | null;
  joiningDate: string | null;

  status: OfferStatus;

  sentAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  expiresAt: string | null;
}

export interface UpdateOfferRequest {
  salary: number;
  departmentId: number | null;
  designationId: number | null;
  employmentType: string | null;
  joiningDate: string | null;
  expiresAt: string | null;
}

export interface RespondToOfferRequest {
  accept: boolean;
}