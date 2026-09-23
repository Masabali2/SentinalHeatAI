import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';

import { PermissionService } from '../../../../core/authorization/permission.service';
import { PERMISSIONS } from '../../../../core/authorization/permission.constants';
import { EmployeeService } from '../../../../core/services/employee.service';
import { EmployeeTaskService } from '../../../../core/services/employee-task.service';

import { Employee } from '../../../../models/employee.model';
import {
  EmployeeTask,
  EmployeeTaskCollaborator
} from '../../../../models/task.model';

@Component({
  selector: 'app-task-collaborators',
  imports: [DatePipe],
  templateUrl: './task-collaborators.html',
  styleUrl: './task-collaborators.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCollaborators implements OnInit {
  private readonly taskService = inject(EmployeeTaskService);
  private readonly employeeService = inject(EmployeeService);
  private readonly permissionService = inject(PermissionService);

  readonly task = input.required<EmployeeTask>();

  readonly collaboratorsChanged = output<void>();

  readonly collaborators = signal<EmployeeTaskCollaborator[]>([]);
  readonly employees = signal<Employee[]>([]);

  readonly isLoading = signal(false);
  readonly isLoadingEmployees = signal(false);
  readonly isAdding = signal(false);
  readonly removingEmployeeId = signal<number | null>(null);
  readonly selectedEmployeeId = signal<number | null>(null);

  readonly errorMessage = signal<string | null>(null);

  readonly canManageCollaborators = computed(() =>
    this.permissionService.hasPermission(
      PERMISSIONS.Task.CollaboratorManage
    )
  );

  readonly availableEmployees = computed(() => {
    const currentTask = this.task();

    const collaboratorIds = new Set(
      this.collaborators().map(collaborator => collaborator.employeeId)
    );

    return this.employees().filter(employee =>
      employee.isActive &&
      employee.id !== currentTask.assignedToEmployeeId &&
      !collaboratorIds.has(employee.id)
    );
  });

  ngOnInit(): void {
    this.loadCollaborators();

    if (this.canManageCollaborators()) {
      this.loadEmployees();
    }
  }

  loadCollaborators(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService.getCollaborators(this.task().id).subscribe({
      next: collaborators => {
        this.collaborators.set(collaborators);
        this.isLoading.set(false);
      },
      error: error => {
        this.collaborators.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'Unable to load collaborators.'
        );
      }
    });
  }

  loadEmployees(): void {
    this.isLoadingEmployees.set(true);

    this.employeeService.getAll().subscribe({
      next: response => {
        this.employees.set(response.data ?? []);
        this.isLoadingEmployees.set(false);
      },
      error: error => {
        this.employees.set([]);
        this.isLoadingEmployees.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'Unable to load employees.'
        );
      }
    });
  }

  onEmployeeChange(value: string): void {
    this.selectedEmployeeId.set(
      value ? Number(value) : null
    );
  }

  addCollaborator(): void {
    if (!this.canManageCollaborators()) {
      return;
    }

    const employeeId = this.selectedEmployeeId();

    if (!this.task().isActive || this.isAdding()) {
      return;
    }

    if (
      !employeeId ||
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {
      this.errorMessage.set('Please select an employee.');
      return;
    }

    this.isAdding.set(true);
    this.errorMessage.set(null);

    this.taskService
      .addCollaborator(this.task().id, { employeeId })
      .subscribe({
        next: collaborator => {
          this.collaborators.update(collaborators => [
            ...collaborators,
            collaborator
          ]);

          this.selectedEmployeeId.set(null);
          this.isAdding.set(false);

          this.collaboratorsChanged.emit();
        },
        error: error => {
          this.isAdding.set(false);
          this.errorMessage.set(
            error?.error?.message ?? 'Unable to add collaborator.'
          );
        }
      });
  }

  removeCollaborator(
    collaborator: EmployeeTaskCollaborator
  ): void {
    if (!this.canManageCollaborators()) {
      return;
    }

    if (
      !this.task().isActive ||
      this.removingEmployeeId() !== null
    ) {
      return;
    }

    this.removingEmployeeId.set(collaborator.employeeId);
    this.errorMessage.set(null);

    this.taskService
      .removeCollaborator(
        this.task().id,
        collaborator.employeeId
      )
      .subscribe({
        next: () => {
          this.collaborators.update(collaborators =>
            collaborators.filter(
              item => item.employeeId !== collaborator.employeeId
            )
          );

          this.removingEmployeeId.set(null);

          this.collaboratorsChanged.emit();
        },
        error: error => {
          this.removingEmployeeId.set(null);
          this.errorMessage.set(
            error?.error?.message ?? 'Unable to remove collaborator.'
          );
        }
      });
  }
}