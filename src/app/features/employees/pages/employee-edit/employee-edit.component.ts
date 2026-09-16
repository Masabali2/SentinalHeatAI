import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, finalize, of } from 'rxjs';

import { DepartmentService } from '../../../../core/services/department.service';
import { DesignationService } from '../../../../core/services/designation.service';
import { AdminService } from '../../../../core/services/admin.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { RoleService } from '../../../../core/services/role.service';
import { Department } from '../../../../models/department.model';
import { Designation } from '../../../../models/designation.model';
import { CreateEmployeeRequest, Employee } from '../../../../models/employee.model';
import { Role } from '../../../../models/role.model';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './employee-edit.component.html',
  styleUrl: './employee-edit.component.css'
})
export class EmployeeEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly designationService = inject(DesignationService);
  private readonly roleService = inject(RoleService);
  private readonly adminService = inject(AdminService);
  private readonly notificationService = inject(NotificationService);

  readonly employee = signal<Employee | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly designations = signal<Designation[]>([]);
  readonly managers = signal<Employee[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  departmentId: number | null = null;
  designationId: number | null = null;
  salary = 0;
  dateOfBirth = '';
  dateOfJoining = '';
  managerId: number | null = null;
  role = '';

  isEmployeeRole(): boolean {
    return this.role.trim().toLowerCase() === 'employee';
  }

  onRoleChange(role: string): void {
    this.role = role;

    if (!this.isEmployeeRole()) {
      this.managerId = null;
    }
  }

  ngOnInit(): void {
    const employeeId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode.set(!!employeeId);
    this.loadLookups(employeeId);
  }

  cancel(): void {
    void this.router.navigate(['/employees']);
  }

  save(): void {
    if (this.isSaving() || !this.isValid()) {
      return;
    }

    const request: CreateEmployeeRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      departmentId: this.departmentId!,
      designationId: this.designationId!,
      salary: Number(this.salary) || 0,
      dateOfBirth: this.dateOfBirth,
      dateOfJoining: this.dateOfJoining,
      managerId: this.managerId
    };

    const employeeId = this.employee()?.id;
    const request$ = employeeId
      ? this.employeeService.update(employeeId, request)
      : this.employeeService.create(request);

    this.isSaving.set(true);
    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: response => {
        if (!response.success || !response.data) {
          this.notificationService.error(response.message || 'Unable to save employee.');
          return;
        }

        const updatedEmployee = response.data;

        if (employeeId && updatedEmployee.userId && this.role) {
          this.adminService.changeUserRole(updatedEmployee.userId, { role: this.role })
            .subscribe({
              next: roleResponse => {
                if (!roleResponse.success) {
                  this.notificationService.error(roleResponse.message || 'Employee saved, but role update failed.');
                  return;
                }

                this.finishSave(response.message || 'Employee updated successfully.', updatedEmployee.id);
              },
              error: error => this.notificationService.error(
                error?.error?.message || error?.error?.Message || 'Employee saved, but role update failed.'
              )
            });
          return;
        }

        this.finishSave(
          response.message || (employeeId ? 'Employee updated successfully.' : 'Employee created successfully.'),
          updatedEmployee.id
        );
      },
      error: error => this.notificationService.error(
        error?.error?.message || error?.error?.Message || 'Unable to save employee.'
      )
    });
  }

  private isValid(): boolean {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) {
      this.notificationService.error('First name, last name, and email are required.');
      return false;
    }

    if (!this.departmentId || !this.designationId) {
      this.notificationService.error('Department and designation are required.');
      return false;
    }

    return true;
  }

  private loadLookups(employeeId: number): void {
    this.isLoading.set(true);
    forkJoin({
      departments: this.departmentService.getAll(),
      designations: this.designationService.getAll(),
      managers: this.employeeService.getManagers(),
      roles: this.roleService.getAll(),
      employee: employeeId
        ? this.employeeService.getById(employeeId)
        : of(null)
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: lookups => {
          this.departments.set(lookups.departments.data || []);
          this.designations.set(lookups.designations.data || []);
          this.managers.set(lookups.managers.data || []);
          this.roles.set(lookups.roles.data || []);

          if (employeeId) {
            if (!lookups.employee?.success || !lookups.employee.data) {
              this.notificationService.error(
                lookups.employee?.message || 'Unable to load employee.'
              );
              return;
            }

            this.employee.set(lookups.employee.data);
            this.populateForm(lookups.employee.data);
          }
        },
        error: error => this.notificationService.error(
          error?.error?.message || error?.error?.Message || 'Unable to load employee form.'
        )
      });
  }

  private populateForm(employee: Employee): void {
    this.firstName = employee.firstName;
    this.lastName = employee.lastName;
    this.email = employee.email;
    this.phone = employee.phone;
    this.departmentId = employee.departmentId;
    this.designationId = employee.designationId;
    this.salary = employee.salary;
    this.dateOfBirth = this.toDateInput(employee.dateOfBirth);
    this.dateOfJoining = this.toDateInput(employee.dateOfJoining);
    this.managerId = employee.managerId;
    this.role = employee.role || '';
  }

  private finishSave(message: string, employeeId: number): void {
    this.notificationService.success(message);
    void this.router.navigate(['/employees', employeeId]);
  }

  private toDateInput(value: string | null): string {
    return value ? new Date(value).toISOString().slice(0, 10) : '';
  }
}
