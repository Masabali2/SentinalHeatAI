import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApiResponse } from '../../models/api-response.model';
import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest
} from '../../models/employee.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/employees`;

  getManagers(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(
      `${this.apiUrl}/managers`
    );
  }

  getAll(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(this.apiUrl);
  }

  getById(employeeId: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(
      `${this.apiUrl}/${employeeId}`
    );
  }

  create(request: CreateEmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(
      this.apiUrl,
      request
    );
  }

  update(
    employeeId: number,
    request: UpdateEmployeeRequest
  ): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(
      `${this.apiUrl}/${employeeId}`,
      request
    );
  }

  delete(employeeId: number): Observable<ApiResponse<object>> {
    return this.http.delete<ApiResponse<object>>(
      `${this.apiUrl}/${employeeId}`
    );
  }

  activate(employeeId: number): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(
      `${this.apiUrl}/${employeeId}/activate`,
      {}
    );
  }

  deactivate(employeeId: number): Observable<ApiResponse<object>> {
    return this.http.patch<ApiResponse<object>>(
      `${this.apiUrl}/${employeeId}/deactivate`,
      {}
    );
  }

  getSubordinates(employeeId: number): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(
      `${this.apiUrl}/${employeeId}/subordinates`
    );
  }
}