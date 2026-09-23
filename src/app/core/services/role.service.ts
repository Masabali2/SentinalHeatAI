import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest
} from '../../models/role.model';

import { Permission } from '../../models/permission.model';

import { UpdateRolePermissionsRequest } from '../../models/role-permission.model';

import { ApiResponse } from '../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/roles`;

  getAll(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(
      this.apiUrl
    );
  }

  getById(
    roleId: string
  ): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(
      `${this.apiUrl}/${roleId}`
    );
  }

  create(
    request: CreateRoleRequest
  ): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(
      this.apiUrl,
      request
    );
  }

  update(
    roleId: string,
    request: UpdateRoleRequest
  ): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(
      `${this.apiUrl}/${roleId}`,
      request
    );
  }

  delete(
    roleId: string
  ): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/${roleId}`
    );
  }

  getPermissions(
    roleId: string
  ): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(
      `${this.apiUrl}/${roleId}/permissions`
    );
  }

  updatePermissions(
    roleId: string,
    request: UpdateRolePermissionsRequest
  ): Observable<ApiResponse<object>> {
    return this.http.put<ApiResponse<object>>(
      `${this.apiUrl}/${roleId}/permissions`,
      request
    );
  }
}