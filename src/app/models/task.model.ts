
export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

export enum TaskStatus {
  Pending = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

export interface EmployeeTask {
  id: number;
  title: string;
  description: string | null;

  assignedToEmployeeId: number;
  assignedToEmployeeName: string;

  assignedByEmployeeId: number;
  assignedByEmployeeName: string;

  dueDate: string | null;
  completedAt: string | null;

  priority: TaskPriority;
  status: TaskStatus;

  isActive: boolean;

  createdAt: string;
  updatedAt: string | null;
}

export interface CreateEmployeeTaskRequest {
  title: string;
  description: string | null;
  assignedToEmployeeId: number;
  dueDate: string | null;
  priority: TaskPriority;
}

export interface UpdateEmployeeTaskRequest {
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface ReassignEmployeeTaskRequest {
  employeeId: number;
}

export interface EmployeeTaskCollaborator {
  id: number;
  employeeTaskId: number;
  employeeId: number;
  employeeName: string;

  addedAt: string;

  addedByEmployeeId: number;
  addedByEmployeeName: string;
}

export interface AssignTaskCollaboratorRequest {
  employeeId: number;
}

export interface EmployeeTaskComment {
  id: number;
  employeeTaskId: number;
  employeeId: number;
  employeeName: string;

  comment: string;

  createdAt: string;
  updatedAt: string | null;
}

export interface AddTaskCommentRequest {
  comment: string;
}

export interface EmployeeTaskHistory {
  id: number;
  employeeTaskId: number;

  action: string;
  oldValue: string | null;
  newValue: string | null;

  changedByEmployeeId: number;
  changedByEmployeeName: string;

  createdAt: string;
}

export interface EmployeeTaskAttachment {
  id: number;
  employeeTaskId: number;

  uploadedByEmployeeId: number;
  uploadedByEmployeeName: string;

  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;

  createdAt: string;
}
