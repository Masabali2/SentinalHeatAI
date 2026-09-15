import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { ApiResponse } from '../../models/api-response.model';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegistrationResponse
} from './auth.models';

import { AuthStateService } from './auth-state.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly authStateService = inject(AuthStateService);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(
    request: LoginRequest
  ): Observable<ApiResponse<AuthResponse>> {

    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.apiUrl}/login`,
      request
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.authStateService.setAuthState(
            response.data
          );
        }
      })
    );
  }

  register(
    request: RegisterRequest
  ): Observable<ApiResponse<RegistrationResponse>> {

    return this.http.post<ApiResponse<RegistrationResponse>>(
      `${this.apiUrl}/register`,
      request
    );
  }

  logout(): void {
    this.authStateService.clearAuthState();
  }
}