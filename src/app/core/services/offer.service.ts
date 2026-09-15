import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment.development';

import {
  Offer,
  CreateOfferRequest,
  UpdateOfferRequest,
  RespondToOfferRequest
} from '../../features/hiring/models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/offer`;

  getByOnboardingId(
    onboardingId: number
  ): Observable<ApiResponse<Offer[]>> {

    return this.http.get<ApiResponse<Offer[]>>(
      `${this.apiUrl}/onboarding/${onboardingId}`
    );
  }

  getById(
    offerId: number
  ): Observable<ApiResponse<Offer>> {

    return this.http.get<ApiResponse<Offer>>(
      `${this.apiUrl}/${offerId}`
    );
  }

  create(
    request: CreateOfferRequest
  ): Observable<ApiResponse<Offer>> {

    return this.http.post<ApiResponse<Offer>>(
      this.apiUrl,
      request
    );
  }

  update(
    offerId: number,
    request: UpdateOfferRequest
  ): Observable<ApiResponse<Offer>> {

    return this.http.put<ApiResponse<Offer>>(
      `${this.apiUrl}/${offerId}`,
      request
    );
  }

  send(
    offerId: number
  ): Observable<ApiResponse<object>> {

    return this.http.post<ApiResponse<object>>(
      `${this.apiUrl}/${offerId}/send`,
      {}
    );
  }

  respondByInvitation(
    token: string,
    request: RespondToOfferRequest
  ): Observable<ApiResponse<string>> {

    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/invitation/respond?token=${encodeURIComponent(token)}`,
      request
    );
  }
}