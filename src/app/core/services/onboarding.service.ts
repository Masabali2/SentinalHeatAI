import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ApiResponse} from '../../models/api-response.model';


import {
  
  CreateOnboardingRequest,
  Onboarding,OnboardingInProgress,
  UpdateOnboardingRequest
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
}