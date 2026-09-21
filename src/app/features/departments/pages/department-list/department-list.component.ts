import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Department } from '../../../../models/department.model';
import { DepartmentService } from '../../../../core/services/department.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.css'
})
export class DepartmentListComponent implements OnInit {
  private readonly departmentService = inject(
    DepartmentService
  );

  private readonly notificationService = inject(
    NotificationService
  );

  private readonly router = inject(Router);

  readonly departments = signal<Department[]>([]);
  readonly isLoading = signal(false);

  readonly openMenuId = signal<number | null>(null);

  readonly showFilters = signal(false);

  readonly searchTerm = signal('');

  readonly statusFilter = signal<
    'all' | 'active' | 'inactive'
  >('all');

  readonly filteredDepartments = computed(() => {
    const departments = this.departments();
    const search = this.searchTerm()
      .trim()
      .toLowerCase();

    const status = this.statusFilter();

    return departments.filter(department => {
      const matchesSearch =
        !search ||
        department.name
          .toLowerCase()
          .includes(search) ||
        department.code
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        status === 'all' ||
        (status === 'active' &&
          department.isActive) ||
        (status === 'inactive' &&
          !department.isActive);

      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  reloadDepartments(): void {
    this.loadDepartments();
  }

  addDepartment(): void {
    void this.router.navigate([
      '/departments/create'
    ]);
  }

  toggleFilters(): void {
    this.showFilters.update(
      value => !value
    );
  }

  setSearchTerm(value: string): void {
    this.searchTerm.set(value);
  }

  setStatusFilter(
    status: 'all' | 'active' | 'inactive'
  ): void {
    this.statusFilter.set(status);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
  }

  toggleActionMenu(
    departmentId: number
  ): void {
    this.openMenuId.update(currentId =>
      currentId === departmentId
        ? null
        : departmentId
    );
  }

  closeActionMenu(): void {
    this.openMenuId.set(null);
  }

  editDepartment(
    department: Department
  ): void {
    this.closeActionMenu();

    void this.router.navigate([
      '/departments',
      department.id,
      'edit'
    ]);
  }

  toggleDepartmentStatus(
    department: Department
  ): void {
    this.closeActionMenu();

    if (department.isActive) {
      this.deactivateDepartment(
        department.id
      );

      return;
    }

    this.activateDepartment(
      department.id
    );
  }

  deleteDepartment(
    department: Department
  ): void {
    this.closeActionMenu();

    const confirmed = window.confirm(
      `Are you sure you want to delete "${department.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.departmentService
      .delete(department.id)
      .subscribe({
        next: response => {
          if (!response.success) {
            this.notificationService.error(
              response.message ||
              'Unable to delete department.'
            );

            return;
          }

          this.notificationService.success(
            'Department deleted successfully.'
          );

          this.loadDepartments();
        },

        error: () => {
          // Global HTTP error handling
          // displays the backend message.
        }
      });
  }

  private activateDepartment(
    departmentId: number
  ): void {
    this.departmentService
      .activate(departmentId)
      .subscribe({
        next: response => {
          if (!response.success) {
            this.notificationService.error(
              response.message ||
              'Unable to activate department.'
            );

            return;
          }

          this.notificationService.success(
            'Department activated successfully.'
          );

          this.loadDepartments();
        },

        error: () => {
          // Global HTTP error handling
          // displays the backend message.
        }
      });
  }

  private deactivateDepartment(
    departmentId: number
  ): void {
    this.departmentService
      .deactivate(departmentId)
      .subscribe({
        next: response => {
          if (!response.success) {
            this.notificationService.error(
              response.message ||
              'Unable to deactivate department.'
            );

            return;
          }

          this.notificationService.success(
            'Department deactivated successfully.'
          );

          this.loadDepartments();
        },

        error: () => {
          // Global HTTP error handling
          // displays the backend message.
        }
      });
  }

  private loadDepartments(): void {
    this.isLoading.set(true);
    this.closeActionMenu();

    this.departmentService
      .getAll()
      .pipe(
        finalize(() =>
          this.isLoading.set(false)
        )
      )
      .subscribe({
        next: response => {
          if (
            !response.success ||
            !response.data
          ) {
            this.notificationService.error(
              response.message ||
              'Unable to load departments.'
            );

            return;
          }

          this.departments.set(
            response.data
          );
        },

        error: () => {
          // Global HTTP error handling
          // displays the backend message.
        }
      });
  }
}