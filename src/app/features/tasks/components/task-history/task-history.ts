import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { PermissionService } from '../../../../core/authorization/permission.service';
import { PERMISSIONS } from '../../../../core/authorization/permission.constants';
import { EmployeeTaskService } from '../../../../core/services/employee-task.service';

import { EmployeeTaskHistory } from '../../models/employee-task.models';

@Component({
  selector: 'app-task-history',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-history.html',
  styleUrl: './task-history.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskHistoryComponent implements OnChanges {

  @Input({ required: true }) taskId!: number;

  private readonly taskService = inject(EmployeeTaskService);
  private readonly permissionService = inject(PermissionService);

  readonly history = signal<EmployeeTaskHistory[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly canViewHistory = computed(() =>
    this.permissionService.hasPermission(
      PERMISSIONS.Task.HistoryView
    )
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['taskId'] &&
      this.taskId &&
      this.canViewHistory()
    ) {
      this.loadHistory();
    }
  }

  private loadHistory(): void {
    if (!this.canViewHistory()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService.getHistory(this.taskId).subscribe({
      next: history => {
        this.history.set(history);
        this.isLoading.set(false);
      },
      error: error => {
        this.history.set([]);
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.message ?? 'Unable to load task history.'
        );
      }
    });
  }
}