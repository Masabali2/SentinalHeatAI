import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';

import {
  EmployeeTask,
  TaskStatus
} from '../../../../models/task.model';

@Component({
  selector: 'app-task-summary',
  imports: [],
  templateUrl: './task-summary.html',
  styleUrl: './task-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskSummary {

  readonly tasks = input<EmployeeTask[]>([]);

  readonly totalTasks = computed(() =>
    this.tasks().length
  );

  readonly pendingTasks = computed(() =>
    this.tasks().filter(
      task => task.status === TaskStatus.Pending
    ).length
  );

  readonly inProgressTasks = computed(() =>
    this.tasks().filter(
      task => task.status === TaskStatus.InProgress
    ).length
  );

  readonly completedTasks = computed(() =>
    this.tasks().filter(
      task => task.status === TaskStatus.Completed
    ).length
  );

  readonly cancelledTasks = computed(() =>
    this.tasks().filter(
      task => task.status === TaskStatus.Cancelled
    ).length
  );

  readonly overdueTasks = computed(() =>
    this.tasks().filter(task =>
      this.isOverdue(task)
    ).length
  );

  readonly activeTasks = computed(() =>
    this.tasks().filter(
      task => task.isActive
    ).length
  );

  readonly inactiveTasks = computed(() =>
    this.tasks().filter(
      task => !task.isActive
    ).length
  );

  private isOverdue(task: EmployeeTask): boolean {
    if (!task.dueDate) {
      return false;
    }

    if (!task.isActive) {
      return false;
    }

    if (
      task.status === TaskStatus.Completed ||
      task.status === TaskStatus.Cancelled
    ) {
      return false;
    }

    return new Date(task.dueDate).getTime() < Date.now();
  }
}