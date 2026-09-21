import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  Designation,
  CreateDesignationRequest,
  UpdateDesignationRequest
} from '../../models/designation.model';

import {
  ApiResponse
} from '../../models/api-response.model';

import {
  environment
} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DesignationService {
  private readonly http = inject(
    HttpClient
  );

  private readonly apiUrl =
    `${environment.apiUrl}/designations`;


  getAll(): Observable<
    ApiResponse<Designation[]>
  > {
    return this.http.get<
      ApiResponse<Designation[]>
    >(this.apiUrl);
  }


  getById(
    id: number
  ): Observable<
    ApiResponse<Designation>
  > {
    return this.http.get<
      ApiResponse<Designation>
    >(
      `${this.apiUrl}/${id}`
    );
  }


  create(
    request: CreateDesignationRequest
  ): Observable<
    ApiResponse<Designation>
  > {
    return this.http.post<
      ApiResponse<Designation>
    >(
      this.apiUrl,
      request
    );
  }


  update(
    id: number,
    request: UpdateDesignationRequest
  ): Observable<
    ApiResponse<Designation>
  > {
    return this.http.put<
      ApiResponse<Designation>
    >(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  delete(
    id: number
  ): Observable<
    ApiResponse<object>
  > {
    return this.http.delete<
      ApiResponse<object>
    >(
      `${this.apiUrl}/${id}`
    );
  }


  activate(
    id: number
  ): Observable<
    ApiResponse<object>
  > {
    return this.http.patch<
      ApiResponse<object>
    >(
      `${this.apiUrl}/${id}/activate`,
      {}
    );
  }


  deactivate(
    id: number
  ): Observable<
    ApiResponse<object>
  > {
    return this.http.patch<
      ApiResponse<object>
    >(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }
}