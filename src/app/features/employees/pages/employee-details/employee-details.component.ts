import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { EmployeeService } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css'
})
export class EmployeeDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);

  readonly employee = signal<Employee | null>(null);
  readonly subordinates = signal<Employee[]>([]);
  readonly isLoading = signal(false);
  readonly isBusy = signal(false);

  ngOnInit(): void {
    this.loadEmployee();
  }

  employeeName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`.trim();
  }

  toggleStatus(): void {
    const employee = this.employee();
    if (!employee || this.isBusy()) {
      return;
    }

    this.isBusy.set(true);
    const request = employee.isActive
      ? this.employeeService.deactivate(employee.id)
      : this.employeeService.activate(employee.id);

    request.pipe(finalize(() => this.isBusy.set(false))).subscribe({
      next: response => {
        if (!response.success) {
          this.notificationService.error(response.message || 'Unable to update employee status.');
          return;
        }

        this.notificationService.success(response.message || 'Employee status updated.');
        this.loadEmployee();
      },
      error: error => this.notificationService.error(
        error?.error?.message || error?.error?.Message || 'Unable to update employee status.'
      )
    });
  }

  deleteEmployee(): void {
    const employee = this.employee();
    if (!employee || this.isBusy() || !window.confirm(`Delete ${this.employeeName(employee)}?`)) {
      return;
    }

    this.isBusy.set(true);
    this.employeeService.delete(employee.id)
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: response => {
          if (!response.success) {
            this.notificationService.error(response.message || 'Unable to delete employee.');
            return;
          }

          this.notificationService.success(response.message || 'Employee deleted successfully.');
          void this.router.navigate(['/employees']);
        },
        error: error => this.notificationService.error(
          error?.error?.message || error?.error?.Message || 'Unable to delete employee.'
        )
      });
  }

  private loadEmployee(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      void this.router.navigate(['/employees']);
      return;
    }

    this.isLoading.set(true);
    this.employeeService.getById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.notificationService.error(response.message || 'Unable to load employee.');
            return;
          }

          this.employee.set(response.data);
          this.loadSubordinates(id);
        },
        error: error => this.notificationService.error(
          error?.error?.message || error?.error?.Message || 'Unable to load employee.'
        )
      });
  }

  private loadSubordinates(employeeId: number): void {
    this.employeeService.getSubordinates(employeeId).subscribe({
      next: response => {
        if (response.success && response.data) {
          this.subordinates.set(response.data);
        }
      }
    });
  }
}
