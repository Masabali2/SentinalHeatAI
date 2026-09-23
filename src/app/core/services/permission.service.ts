import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest
} from '../../models/permission.model';

import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/permissions`;

  getAll(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(
      this.apiUrl
    );
  }

  getById(
    permissionId: number
  ): Observable<ApiResponse<Permission>> {
    return this.http.get<ApiResponse<Permission>>(
      `${this.apiUrl}/${permissionId}`
    );
  }

  create(
    request: CreatePermissionRequest
  ): Observable<ApiResponse<Permission>> {
    return this.http.post<ApiResponse<Permission>>(
      this.apiUrl,
      request
    );
  }

  update(
    permissionId: number,
    request: UpdatePermissionRequest
  ): Observable<ApiResponse<Permission>> {
    return this.http.put<ApiResponse<Permission>>(
      `${this.apiUrl}/${permissionId}`,
      request
    );
  }

  delete(
    permissionId: number
  ): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/${permissionId}`
    );
  }
}