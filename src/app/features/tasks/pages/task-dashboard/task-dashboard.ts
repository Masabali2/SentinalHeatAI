import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { EmployeeTaskService } from '../../../../core/services/employee-task.service';
import {
  EmployeeTask,
  TaskPriority,
  TaskStatus
} from '../../../../models/task.model';

import {
  TaskFilterState,
  TaskFilters
} from '../../components/task-filters/task-filters';
import {TaskCard}  from '../../components/task-card/task-card';
import { TaskSummary } from '../../components/task-summary/task-summary';

@Component({
  selector: 'app-task-dashboard',
  imports: [
    TaskSummary,
    TaskFilters,
    TaskCard
  ],
  templateUrl: './task-dashboard.html',
  styleUrl: './task-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDashboard implements OnInit {

  private readonly authStateService = inject(AuthStateService);
  private readonly taskService = inject(EmployeeTaskService);

  readonly tasks = signal<EmployeeTask[]>([]);
  readonly isLoading = signal(false);

  readonly filters = signal<TaskFilterState>(
    this.createDefaultFilters()
  );

  readonly currentRole = computed(() =>
    this.getTaskRole()
  );

  readonly filteredTasks = computed(() =>
    this.applyFilters(
      this.tasks(),
      this.filters()
    )
  );

  readonly hasTasks = computed(() =>
    this.filteredTasks().length > 0
  );

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const role = this.currentRole();

    if (!role) {
      this.tasks.set([]);
      return;
    }

    this.isLoading.set(true);

    const request$ =
      role === 'Employee'
        ? this.taskService.getMyTasks()
        : this.taskService.getAssignedTasks();

    request$.subscribe({
      next: tasks => {
        this.tasks.set(tasks);
        this.isLoading.set(false);
      },
      error: () => {
        this.tasks.set([]);
        this.isLoading.set(false);
      }
    });
  }

  onFiltersChanged(filters: TaskFilterState): void {
    this.filters.set(filters);
  }

  reload(): void {
    this.loadTasks();
  }

  private applyFilters(
    tasks: EmployeeTask[],
    filters: TaskFilterState
  ): EmployeeTask[] {

    const search = filters.search.trim().toLowerCase();

    return tasks.filter(task => {

      if (search) {
        const matchesSearch =
          task.title.toLowerCase().includes(search) ||
          (task.description?.toLowerCase().includes(search) ?? false) ||
          task.assignedToEmployeeName
            .toLowerCase()
            .includes(search);

        if (!matchesSearch) {
          return false;
        }
      }

      if (
        filters.status !== null &&
        task.status !== filters.status
      ) {
        return false;
      }

      if (
        filters.priority !== null &&
        task.priority !== filters.priority
      ) {
        return false;
      }

      if (
        filters.isActive !== null &&
        task.isActive !== filters.isActive
      ) {
        return false;
      }

      if (
        filters.employeeId !== null &&
        task.assignedToEmployeeId !== filters.employeeId
      ) {
        return false;
      }

      if (
        filters.dueFilter !== null &&
        !this.matchesDueFilter(task, filters.dueFilter)
      ) {
        return false;
      }

      return true;
    });
  }

  private matchesDueFilter(
    task: EmployeeTask,
    filter: TaskFilterState['dueFilter']
  ): boolean {

    if (!task.dueDate || !filter) {
      return false;
    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();

    if (filter === 'overdue') {
      return (
        task.isActive &&
        task.status !== TaskStatus.Completed &&
        task.status !== TaskStatus.Cancelled &&
        dueDate.getTime() < now.getTime()
      );
    }

    if (filter === 'today') {
      return this.isSameDay(dueDate, now);
    }

    if (filter === 'week') {
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const endOfWeek = new Date(startOfToday);
      endOfWeek.setDate(
        startOfToday.getDate() + 7
      );

      return (
        dueDate >= startOfToday &&
        dueDate < endOfWeek
      );
    }

    return true;
  }

  private isSameDay(
    firstDate: Date,
    secondDate: Date
  ): boolean {

    return (
      firstDate.getFullYear() === secondDate.getFullYear() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getDate() === secondDate.getDate()
    );
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

  private getTaskRole():
    'Admin' | 'Manager' | 'Employee' | null {

    const roles = this.authStateService.roles();

    if (roles.includes('Admin')) {
      return 'Admin';
    }

    if (roles.includes('Manager')) {
      return 'Manager';
    }

    if (roles.includes('Employee')) {
      return 'Employee';
    }

    return null;
  }
}