import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskHistoryComponent } from '../../components/task-history/task-history';

import { EmployeeService } from '../../../../core/services/employee.service';
import { EmployeeTaskService } from '../../../../core/services/employee-task.service';
import { TaskComments } from '../../components/task-comments/task-comments';
import { PermissionService } from '../../../../core/authorization/permission.service';
import { PERMISSIONS } from '../../../../core/authorization/permission.constants';
import {
  EmployeeTask,
  ReassignEmployeeTaskRequest,
  TaskPriority,
  TaskStatus
} from '../../../../models/task.model';

import { Employee } from '../../../../models/employee.model';

import { TaskCollaborators } from '../../components/task-collaborators/task-collaborators';

@Component({
  selector: 'app-task-details',
  imports: [
    TaskCollaborators,
    TaskHistoryComponent,
    TaskComments
  ],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDetails implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
private readonly permissionService = inject(PermissionService);
  private readonly taskService =
    inject(EmployeeTaskService);

  private readonly employeeService =
    inject(EmployeeService);

  readonly task =
    signal<EmployeeTask | null>(null);

  readonly isLoading =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);

  readonly TaskStatus = TaskStatus;
readonly canUpdateStatus = computed(() =>
  this.permissionService.hasPermission(
    PERMISSIONS.Task.StatusUpdate
  )
);

readonly canReassign = computed(() =>
  this.permissionService.hasPermission(
    PERMISSIONS.Task.Reassign
  )
);

readonly canEdit = computed(() =>
  this.permissionService.hasPermission(
    PERMISSIONS.Task.Update
  )
);
  // --------------------------------------------------
  // Status Management
  // --------------------------------------------------

  readonly isUpdatingStatus =
    signal(false);

  readonly statusError =
    signal<string | null>(null);
readonly availableStatuses = computed(() => {
  const currentTask = this.task();

  if (!currentTask) {
    return [];
  }

  switch (currentTask.status) {
    case TaskStatus.Pending:
      return [
        {
          value: TaskStatus.InProgress,
          label: 'Start Task'
        },
        {
          value: TaskStatus.Cancelled,
          label: 'Cancel Task'
        }
      ];

    case TaskStatus.InProgress:
      return [
        {
          value: TaskStatus.Completed,
          label: 'Complete Task'
        },
        {
          value: TaskStatus.Cancelled,
          label: 'Cancel Task'
        }
      ];

    case TaskStatus.Completed:
      return [];

    case TaskStatus.Cancelled:
      return [];

    default:
      return [];
  }
});
  // --------------------------------------------------
  // Employee / Reassignment
  // --------------------------------------------------

  readonly employees =
    signal<Employee[]>([]);

  readonly isLoadingEmployees =
    signal(false);

  readonly reassignEmployeeId =
    signal<number | null>(null);

  readonly isReassigning =
    signal(false);

  readonly reassignError =
    signal<string | null>(null);

  readonly availableEmployees = computed(() => {
    const currentTask = this.task();

    return this.employees().filter(employee =>
      employee.isActive &&
      employee.id !== currentTask?.assignedToEmployeeId
    );
  });

  // --------------------------------------------------
  // Display
  // --------------------------------------------------

  readonly statusLabel = computed(() => {
    const currentTask = this.task();

    if (!currentTask) {
      return '';
    }

    return this.getStatusLabel(
      currentTask.status
    );
  });

  readonly priorityLabel = computed(() => {
    const currentTask = this.task();

    if (!currentTask) {
      return '';
    }

    return this.getPriorityLabel(
      currentTask.priority
    );
  });

  readonly isOverdue = computed(() => {
    const currentTask = this.task();

    if (!currentTask?.dueDate) {
      return false;
    }

    if (!currentTask.isActive) {
      return false;
    }

    if (
      currentTask.status === TaskStatus.Completed ||
      currentTask.status === TaskStatus.Cancelled
    ) {
      return false;
    }

    return (
      new Date(currentTask.dueDate).getTime() <
      Date.now()
    );
  });

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------

  ngOnInit(): void {
    const taskId = this.getTaskId();

    if (!taskId) {
      this.errorMessage.set(
        'Invalid task ID.'
      );

      return;
    }

    this.loadTask(taskId);
    this.loadEmployees();
  }

  // --------------------------------------------------
  // Task Loading
  // --------------------------------------------------

  reload(): void {
    const taskId = this.getTaskId();

    if (!taskId) {
      return;
    }

    this.loadTask(taskId);
    this.loadEmployees();
  }

  private loadTask(taskId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .getById(taskId)
      .subscribe({
        next: task => {
          this.task.set(task);
          this.isLoading.set(false);
        },

        error: error => {
          this.task.set(null);
          this.isLoading.set(false);

          this.errorMessage.set(
            error?.error?.message ??
            'Unable to load task.'
          );
        }
      });
  }

  // --------------------------------------------------
  // Status Management
  // --------------------------------------------------
updateStatus(status: TaskStatus): void {
  const currentTask = this.task();

  if (
  !this.canUpdateStatus() ||
  !currentTask ||
  !currentTask.isActive ||
  this.isUpdatingStatus()
) {
  return;
}

  const isAllowedStatus = this.availableStatuses()
    .some(action => action.value === status);

  if (!isAllowedStatus) {
    return;
  }

  this.isUpdatingStatus.set(true);
  this.statusError.set(null);

  this.taskService
    .updateStatus(
      currentTask.id,
      { status }
    )
    .subscribe({
      next: updatedTask => {
        this.task.set(updatedTask);
        this.isUpdatingStatus.set(false);
      },

      error: error => {
        this.isUpdatingStatus.set(false);

        this.statusError.set(
          error?.error?.message ??
          'Unable to update task status.'
        );
      }
    });
}

  // --------------------------------------------------
  // Employee Loading
  // --------------------------------------------------

  loadEmployees(): void {
    this.isLoadingEmployees.set(true);
    this.reassignError.set(null);

    this.employeeService
      .getAll()
      .subscribe({
        next: response => {
          this.employees.set(
            response.data ?? []
          );

          this.isLoadingEmployees.set(false);
        },

        error: error => {
          this.employees.set([]);
          this.isLoadingEmployees.set(false);

          this.reassignError.set(
            error?.error?.message ??
            'Unable to load employees.'
          );
        }
      });
  }

  // --------------------------------------------------
  // Reassignment
  // --------------------------------------------------

  onReassignEmployeeChange(
    value: string
  ): void {
    this.reassignEmployeeId.set(
      value
        ? Number(value)
        : null
    );
  }

  reassignTask(): void {
    const currentTask = this.task();

    const employeeId =
      this.reassignEmployeeId();

   if (
  !this.canReassign() ||
  !currentTask ||
  !currentTask.isActive ||
  this.isReassigning()
) {
  return;
}
    if (
      !employeeId ||
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      this.reassignError.set(
        'Please select an employee.'
      );

      return;
    }

    if (
      employeeId ===
      currentTask.assignedToEmployeeId
    ) {
      this.reassignError.set(
        'The task is already assigned to this employee.'
      );

      return;
    }

    const request: ReassignEmployeeTaskRequest = {
      employeeId
    };

    this.isReassigning.set(true);
    this.reassignError.set(null);

    this.taskService
      .reassign(
        currentTask.id,
        request
      )
      .subscribe({
        next: updatedTask => {
          this.task.set(updatedTask);

          this.reassignEmployeeId.set(null);

          this.isReassigning.set(false);
        },

        error: error => {
          this.isReassigning.set(false);

          this.reassignError.set(
            error?.error?.message ??
            'Unable to reassign the task.'
          );
        }
      });
  }

  // --------------------------------------------------
  // Navigation
  // --------------------------------------------------

  onBack(): void {
    this.router.navigate([
      '/tasks'
    ]);
  }

 onEdit(): void {
  if (!this.canEdit()) {
    return;
  }

  const currentTask = this.task();

  if (!currentTask) {
    return;
  }

  this.router.navigate([
    '/tasks',
    currentTask.id,
    'edit'
  ]);
}
  // --------------------------------------------------
  // Formatting
  // --------------------------------------------------

  formatDate(
    date: string | null
  ): string {
    if (!date) {
      return 'Not specified';
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }
    ).format(
      new Date(date)
    );
  }

  private getStatusLabel(
    status: TaskStatus
  ): string {

    switch (status) {

      case TaskStatus.Pending:
        return 'Pending';

      case TaskStatus.InProgress:
        return 'In Progress';

      case TaskStatus.Completed:
        return 'Completed';

      case TaskStatus.Cancelled:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }

  private getPriorityLabel(
    priority: TaskPriority
  ): string {

    switch (priority) {

      case TaskPriority.Low:
        return 'Low';

      case TaskPriority.Medium:
        return 'Medium';

      case TaskPriority.High:
        return 'High';

      case TaskPriority.Critical:
        return 'Critical';

      default:
        return 'Unknown';
    }
  }

  private getTaskId(): number | null {
    const taskId =
      this.route.snapshot.paramMap.get(
        'taskId'
      );

    if (!taskId) {
      return null;
    }

    const parsedTaskId =
      Number(taskId);

    if (
      !Number.isInteger(parsedTaskId) ||
      parsedTaskId <= 0
    ) {
      return null;
    }

    return parsedTaskId;
  }
}