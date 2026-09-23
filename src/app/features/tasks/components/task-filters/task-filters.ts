import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';

import {
  EmployeeTask,
  TaskPriority,
  TaskStatus
} from '../../../../models/task.model';

import {TaskFilterState} from '../../../../models/task.model';

@Component({
  selector: 'app-task-filters',
  imports: [],
  templateUrl: './task-filters.html',
  styleUrl: './task-filters.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskFilters {

  readonly tasks = input<EmployeeTask[]>([]);

  readonly filtersChanged = output<TaskFilterState>();

  readonly hasActiveFilters = computed(() => {
    const filters = this.filters;

    return (
      filters.search.trim().length > 0 ||
      filters.status !== null ||
      filters.priority !== null ||
      filters.isActive !== null ||
      filters.employeeId !== null ||
      filters.dueFilter !== null
    );
  });

  readonly employees = computed(() => {
    const employeeMap = new Map<number, string>();

    for (const task of this.tasks()) {
      if (!employeeMap.has(task.assignedToEmployeeId)) {
        employeeMap.set(
          task.assignedToEmployeeId,
          task.assignedToEmployeeName
        );
      }
    }

    return Array.from(employeeMap.entries())
      .map(([id, name]) => ({
        id,
        name
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  });

  readonly statuses = [
    {
      value: TaskStatus.Pending,
      label: 'Pending'
    },
    {
      value: TaskStatus.InProgress,
      label: 'In Progress'
    },
    {
      value: TaskStatus.Completed,
      label: 'Completed'
    },
    {
      value: TaskStatus.Cancelled,
      label: 'Cancelled'
    }
  ];

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

  readonly dueFilters = [
    {
      value: 'today' as const,
      label: 'Due Today'
    },
    {
      value: 'week' as const,
      label: 'Due This Week'
    },
    {
      value: 'overdue' as const,
      label: 'Overdue'
    }
  ];

  private filters: TaskFilterState = this.createDefaultFilters();

  onSearch(value: string): void {
    this.filters = {
      ...this.filters,
      search: value
    };

    this.emitFilters();
  }

  onStatusChange(value: string): void {
    this.filters = {
      ...this.filters,
      status: value
        ? Number(value) as TaskStatus
        : null
    };

    this.emitFilters();
  }

  onPriorityChange(value: string): void {
    this.filters = {
      ...this.filters,
      priority: value
        ? Number(value) as TaskPriority
        : null
    };

    this.emitFilters();
  }

  onActiveChange(value: string): void {
    let isActive: boolean | null = null;

    if (value === 'active') {
      isActive = true;
    }

    if (value === 'inactive') {
      isActive = false;
    }

    this.filters = {
      ...this.filters,
      isActive
    };

    this.emitFilters();
  }

  onEmployeeChange(value: string): void {
    this.filters = {
      ...this.filters,
      employeeId: value
        ? Number(value)
        : null
    };

    this.emitFilters();
  }

  onDueFilterChange(value: string): void {
    this.filters = {
      ...this.filters,
      dueFilter: value
        ? value as TaskFilterState['dueFilter']
        : null
    };

    this.emitFilters();
  }

  clearFilters(): void {
    this.filters = this.createDefaultFilters();

    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChanged.emit({
      ...this.filters
    });
  }

  private createDefaultFilters(): TaskFilterState {
    return {
      search: '',
      status: null,
      priority: null,
      isActive: null,
      employeeId: null,
      dueFilter: null
    };
  }
}