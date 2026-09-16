import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../models/api-response.model';
import { ChangeUserRoleRequest } from '../../models/role.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  changeUserRole(
    userId: string,
    request: ChangeUserRoleRequest
  ): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(
      `${this.apiUrl}/users/${userId}/role`,
      request
    );
  }
}
