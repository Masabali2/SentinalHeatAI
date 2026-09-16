import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { EmployeeService } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent implements OnInit {
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);

  readonly employees = signal<Employee[]>([]);
  readonly isLoading = signal(false);
  readonly busyEmployeeId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly openActionMenu = signal<number | null>(null);

  search = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  ngOnInit(): void {
    this.loadEmployees();
  }

  get filteredEmployees(): Employee[] {
    const query = this.search.trim().toLowerCase();

    return this.employees().filter(employee => {
      const matchesSearch = !query || [
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.employeeCode,
        employee.departmentName,
        employee.designationName
      ].some(value => value?.toLowerCase().includes(query));

      const matchesStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && employee.isActive) ||
        (this.statusFilter === 'inactive' && !employee.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  toggleActionMenu(employeeId: number): void {
    this.openActionMenu.update(currentId =>
      currentId === employeeId ? null : employeeId
    );
  }

  closeActionMenu(): void {
    this.openActionMenu.set(null);
  }

  deleteEmployee(employee: Employee): void {
    if (this.busyEmployeeId() !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${this.employeeName(employee)}? This will deactivate the employee account.`
    );

    if (!confirmed) {
      return;
    }

    this.closeActionMenu();

    this.runEmployeeAction(
      employee,
      this.employeeService.delete(employee.id),
      'Employee deleted successfully.'
    );
  }

  toggleStatus(employee: Employee): void {
    if (this.busyEmployeeId() !== null) {
      return;
    }

    this.closeActionMenu();

    const request = employee.isActive
      ? this.employeeService.deactivate(employee.id)
      : this.employeeService.activate(employee.id);

    this.runEmployeeAction(
      employee,
      request,
      employee.isActive
        ? 'Employee deactivated successfully.'
        : 'Employee activated successfully.'
    );
  }

  employeeName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`.trim() || employee.email;
  }

  loadEmployees(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.employeeService
      .getAll()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.errorMessage.set(response.message || 'Unable to load employees.');
            return;
          }

          this.employees.set(response.data);
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.message || error?.error?.Message || 'Unable to load employees.'
          );
        }
      });
  }

  private runEmployeeAction(
    employee: Employee,
    request: ReturnType<EmployeeService['delete']>,
    successMessage: string
  ): void {
    this.busyEmployeeId.set(employee.id);

    request
      .pipe(finalize(() => this.busyEmployeeId.set(null)))
      .subscribe({
        next: response => {
          if (!response.success) {
            this.notificationService.error(response.message || 'Unable to update employee.');
            return;
          }

          this.notificationService.success(response.message || successMessage);
          this.loadEmployees();
        },
        error: error => {
          this.notificationService.error(
            error?.error?.message || error?.error?.Message || 'Unable to update employee.'
          );
        }
      });
  }
}
