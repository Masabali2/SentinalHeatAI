import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ApiResponse} from '../../models/api-response.model';


import {
  
  CreateOnboardingRequest,
  Onboarding,OnboardingInProgress,
  UpdateOnboardingRequest,
  CandidateOnboarding,
  SubmitOnboardingRequest
} from '../../features/hiring/models/onboarding.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =`${environment.apiUrl}/onboarding`;

  createOnboarding(
    request: CreateOnboardingRequest
  ): Observable<ApiResponse<Onboarding>> {

    return this.http.post<ApiResponse<Onboarding>>(
      this.apiUrl,
      request
    );
  }
  getInProgress(): Observable<ApiResponse<OnboardingInProgress[]>> {
  return this.http.get<ApiResponse<OnboardingInProgress[]>>(
    `${this.apiUrl}/in-progress`
  );
}
getById(
  onboardingId: number
): Observable<ApiResponse<Onboarding>> {
  return this.http.get<ApiResponse<Onboarding>>(
    `${this.apiUrl}/${onboardingId}`
  );
}

updateOnboarding(
  onboardingId: number,
  request: UpdateOnboardingRequest
): Observable<ApiResponse<Onboarding>> {
  return this.http.put<ApiResponse<Onboarding>>(
    `${this.apiUrl}/${onboardingId}`,
    request
  );
}

  resendRegistrationEmail(
    onboardingId: number
  ): Observable<ApiResponse<string>> {

    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/${onboardingId}/resend-registration`,
      {}
    );
  }

  resendVerificationEmail(
    onboardingId: number
  ): Observable<ApiResponse<string>> {

    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/${onboardingId}/resend-verification`,
      {}
    );
  }

  getByInvitationToken(
    token: string
  ): Observable<ApiResponse<CandidateOnboarding>> {
    return this.http.get<ApiResponse<CandidateOnboarding>>(
      `${this.apiUrl}/invitation?token=${encodeURIComponent(token)}`
    );
  }

  submitByInvitation(
    token: string,
    request: SubmitOnboardingRequest
  ): Observable<ApiResponse<string>> {
    const formData = new FormData();

    formData.append('FirstName', request.firstName);
    formData.append('LastName', request.lastName);
    formData.append('DateOfBirth', request.dateOfBirth);
    formData.append('Phone', request.phone);
    formData.append('Address', request.address);
    formData.append('City', request.city);
    formData.append('PostalCode', request.postalCode);
    formData.append('EmergencyContactName', request.emergencyContactName);
    formData.append('EmergencyContactPhone', request.emergencyContactPhone);
    formData.append('EmergencyContactRelation', request.emergencyContactRelation);
    formData.append('Password', request.password);

    if (request.profilePicture) {
      formData.append('ProfilePicture', request.profilePicture);
    }

    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/invitation/register?token=${encodeURIComponent(token)}`,
      formData
    );
  }
}