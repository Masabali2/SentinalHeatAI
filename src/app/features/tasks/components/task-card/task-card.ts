
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,output
} from '@angular/core';

import {
  EmployeeTask,
  TaskPriority,
  TaskStatus
} from '../../../../models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCard {
  readonly task = input.required<EmployeeTask>();

  readonly statusLabel = computed(() =>
    this.getStatusLabel(this.task().status)
  );

  readonly priorityLabel = computed(() =>
    this.getPriorityLabel(this.task().priority)
  );

  readonly isOverdue = computed(() =>
    this.checkIsOverdue(this.task())
  );

  readonly isDueSoon = computed(() =>
    this.checkIsDueSoon(this.task())
  );
readonly viewDetails = output<number>();
  private getStatusLabel(status: TaskStatus): string {
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

  private getPriorityLabel(priority: TaskPriority): string {
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

  private checkIsOverdue(task: EmployeeTask): boolean {
    if (
      !task.isActive ||
      !task.dueDate ||
      task.status === TaskStatus.Completed ||
      task.status === TaskStatus.Cancelled
    ) {
      return false;
    }

    return new Date(task.dueDate).getTime() < Date.now();
  }

  private checkIsDueSoon(task: EmployeeTask): boolean {
    if (
      !task.isActive ||
      !task.dueDate ||
      task.status === TaskStatus.Completed ||
      task.status === TaskStatus.Cancelled ||
      this.checkIsOverdue(task)
    ) {
      return false;
    }

    const now = Date.now();
    const dueDate = new Date(task.dueDate).getTime();

    const twentyFourHours = 24 * 60 * 60 * 1000;

    return dueDate - now <= twentyFourHours;
  }

  formatDueDate(date: string | null): string {
    if (!date) {
      return 'No due date';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
}
