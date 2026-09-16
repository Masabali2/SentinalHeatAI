import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailVerificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/EmailVerification`;

  verify(token: string, otp: string): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(
      `${this.apiUrl}/verify`,
      { token, otp }
    );
  }

  resend(token: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/resend?token=${encodeURIComponent(token)}`,
      {}
    );
  }
}