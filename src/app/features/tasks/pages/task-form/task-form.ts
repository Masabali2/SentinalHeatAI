import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { PermissionService } from '../../../../core/authorization/permission.service';
import { PERMISSIONS } from '../../../../core/authorization/permission.constants';
import { EmployeeTaskService } from '../../../../core/services/employee-task.service';

import {
  CreateEmployeeTaskRequest,
  EmployeeTask,
  TaskPriority,
  UpdateEmployeeTaskRequest
} from '../../../../models/task.model';

@Component({
  selector: 'app-task-form',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskForm implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly taskService = inject(EmployeeTaskService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly permissionService = inject(PermissionService);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly task = signal<EmployeeTask | null>(null);

  readonly isEditMode = computed(() =>
    this.task() !== null
  );

  readonly canCreateTask = computed(() =>
    this.permissionService.hasPermission(
      PERMISSIONS.Task.Create
    )
  );

  readonly canUpdateTask = computed(() =>
    this.permissionService.hasPermission(
      PERMISSIONS.Task.Update
    )
  );

  readonly canSubmit = computed(() =>
    this.isEditMode()
      ? this.canUpdateTask()
      : this.canCreateTask()
  );

  readonly pageTitle = computed(() =>
    this.isEditMode()
      ? 'Edit Task'
      : 'Create Task'
  );

  readonly submitLabel = computed(() =>
    this.isEditMode()
      ? 'Update Task'
      : 'Create Task'
  );

  readonly priorities = [
    {
      value: TaskPriority.Low,
      label: 'Low'
    },
    {
      value: TaskPriority.Medium,
      label: 'Medium'
    },
    {
      value: TaskPriority.High,
      label: 'High'
    },
    {
      value: TaskPriority.Critical,
      label: 'Critical'
    }
  ];

  readonly taskForm = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.maxLength(200)
      ]
    ],

    description: [
      '',
      [
        Validators.maxLength(2000)
      ]
    ],

    assignedToEmployeeId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    dueDate: [
      ''
    ],

    priority: [
      TaskPriority.Medium,
      [
        Validators.required
      ]
    ]
  });

  ngOnInit(): void {
    const taskId = this.getTaskId();

    if (taskId === null) {
      return;
    }

    this.loadTask(taskId);
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.submitError.set(
        'You do not have permission to perform this action.'
      );
      return;
    }

    this.submitError.set(null);

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    if (this.isEditMode()) {
      this.updateTask();
      return;
    }

    this.createTask();
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  private createTask(): void {
    if (!this.canCreateTask()) {
      this.isSubmitting.set(false);
      this.submitError.set(
        'You do not have permission to create tasks.'
      );
      return;
    }

    const value = this.taskForm.getRawValue();

    const request: CreateEmployeeTaskRequest = {
      title: value.title.trim(),
      description: value.description.trim() || null,
      assignedToEmployeeId: value.assignedToEmployeeId,
      dueDate: value.dueDate || null,
      priority: value.priority
    };

    this.taskService.create(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/tasks']);
      },
      error: error => {
        this.isSubmitting.set(false);
        this.submitError.set(
          error?.error?.message ??
          'Unable to create the task.'
        );
      }
    });
  }

  private updateTask(): void {
    if (!this.canUpdateTask()) {
      this.isSubmitting.set(false);
      this.submitError.set(
        'You do not have permission to update tasks.'
      );
      return;
    }

    const currentTask = this.task();

    if (!currentTask) {
      this.isSubmitting.set(false);
      return;
    }

    const value = this.taskForm.getRawValue();

    const request: UpdateEmployeeTaskRequest = {
      title: value.title.trim(),
      description: value.description.trim() || null,
      dueDate: value.dueDate || null,
      priority: value.priority
    };

    this.taskService.update(
      currentTask.id,
      request
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);

        this.router.navigate([
          '/tasks',
          currentTask.id
        ]);
      },
      error: error => {
        this.isSubmitting.set(false);
        this.submitError.set(
          error?.error?.message ??
          'Unable to update the task.'
        );
      }
    });
  }

  private loadTask(taskId: number): void {
    this.isLoading.set(true);
    this.submitError.set(null);

    this.taskService.getById(taskId).subscribe({
      next: task => {
        this.task.set(task);
        this.populateForm(task);
        this.isLoading.set(false);
      },
      error: error => {
        this.isLoading.set(false);
        this.submitError.set(
          error?.error?.message ??
          'Unable to load the task.'
        );
      }
    });
  }

  private populateForm(task: EmployeeTask): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description ?? '',
      assignedToEmployeeId: task.assignedToEmployeeId,
      dueDate: this.toDateTimeLocal(task.dueDate),
      priority: task.priority
    });

    this.taskForm.controls.assignedToEmployeeId.disable();
  }

  private getTaskId(): number | null {
    const value = this.route.snapshot.paramMap.get('taskId');

    if (!value) {
      return null;
    }

    const taskId = Number(value);

    return Number.isInteger(taskId) && taskId > 0
      ? taskId
      : null;
  }

  private toDateTimeLocal(
    value: string | null
  ): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    const hours = String(
      date.getHours()
    ).padStart(2, '0');

    const minutes = String(
      date.getMinutes()
    ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}