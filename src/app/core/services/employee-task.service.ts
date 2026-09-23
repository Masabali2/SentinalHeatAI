import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

import {
  AddTaskCommentRequest,
  AssignTaskCollaboratorRequest,
  CreateEmployeeTaskRequest,
  EmployeeTask,
  EmployeeTaskCollaborator,
  EmployeeTaskComment,
  EmployeeTaskHistory,
  ReassignEmployeeTaskRequest,
  UpdateEmployeeTaskRequest,
  UpdateTaskStatusRequest
} from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeTaskService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/EmployeeTask`;

  // Task retrieval

  getById(taskId: number): Observable<EmployeeTask> {
    return this.http.get<EmployeeTask>(
      `${this.apiUrl}/${taskId}`
    );
  }

  getMyTasks(): Observable<EmployeeTask[]> {
    return this.http.get<EmployeeTask[]>(
      `${this.apiUrl}/my`
    );
  }

  getAssignedTasks(): Observable<EmployeeTask[]> {
    return this.http.get<EmployeeTask[]>(
      `${this.apiUrl}/assigned`
    );
  }

  // Task management

  create(
    request: CreateEmployeeTaskRequest
  ): Observable<EmployeeTask> {
    return this.http.post<EmployeeTask>(
      this.apiUrl,
      request
    );
  }

  update(
    taskId: number,
    request: UpdateEmployeeTaskRequest
  ): Observable<EmployeeTask> {
    return this.http.put<EmployeeTask>(
      `${this.apiUrl}/${taskId}`,
      request
    );
  }
  getCollaborators(
  taskId: number
): Observable<EmployeeTaskCollaborator[]> {
  return this.http.get<EmployeeTaskCollaborator[]>(
    `${this.apiUrl}/${taskId}/collaborators`
  );
}

  updateStatus(
    taskId: number,
    request: UpdateTaskStatusRequest
  ): Observable<EmployeeTask> {
    return this.http.patch<EmployeeTask>(
      `${this.apiUrl}/${taskId}/status`,
      request
    );
  }

  activate(taskId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${taskId}/activate`,
      {}
    );
  }

  deactivate(taskId: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${taskId}/deactivate`,
      {}
    );
  }

  reassign(
    taskId: number,
    request: ReassignEmployeeTaskRequest
  ): Observable<EmployeeTask> {
    return this.http.patch<EmployeeTask>(
      `${this.apiUrl}/${taskId}/reassign`,
      request
    );
  }

  // Collaborators

  addCollaborator(
    taskId: number,
    request: AssignTaskCollaboratorRequest
  ): Observable<EmployeeTaskCollaborator> {
    return this.http.post<EmployeeTaskCollaborator>(
      `${this.apiUrl}/${taskId}/collaborators`,
      request
    );
  }

  removeCollaborator(
    taskId: number,
    employeeId: number
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${taskId}/collaborators/${employeeId}`
    );
  }

  // Comments

  addComment(
    taskId: number,
    request: AddTaskCommentRequest
  ): Observable<EmployeeTaskComment> {
    return this.http.post<EmployeeTaskComment>(
      `${this.apiUrl}/${taskId}/comments`,
      request
    );
  }

  getComments(
    taskId: number
  ): Observable<EmployeeTaskComment[]> {
    return this.http.get<EmployeeTaskComment[]>(
      `${this.apiUrl}/${taskId}/comments`
    );
  }

  // History

  getHistory(
    taskId: number
  ): Observable<EmployeeTaskHistory[]> {
    return this.http.get<EmployeeTaskHistory[]>(
      `${this.apiUrl}/${taskId}/history`
    );
  }
}

