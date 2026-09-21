import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest
} from '../../models/department.model';

import { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/departments`;

  getAll(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    request: CreateDepartmentRequest
  ): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(
      this.apiUrl,
      request
    );
  }

  update(
    id: number,
    request: UpdateDepartmentRequest
  ): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  delete(
    id: number
  ): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/${id}`
    );
  }

  activate(
    id: number
  ): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }

  deactivate(
    id: number
  ): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }
}