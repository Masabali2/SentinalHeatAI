import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { OnboardingService } from '../../../../core/services/onboarding.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { HiringLookupService } from '../../services/hiring-lookups.service';

import { Employee } from '../../../../models/employee.model';
import { Department } from '../../../../models/department.model';
import { Designation } from '../../../../models/designation.model';

import { CreateOnboardingRequest } from '../../models/onboarding.model';

@Component({
  selector: 'app-single-hiring',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './single-hiring.component.html',
  styleUrl: './single-hiring.component.css'
})
export class SingleHiringComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingService);
  private readonly notificationService = inject(NotificationService);
  private readonly hiringLookupService = inject(HiringLookupService);

  readonly isSubmitting = signal(false);
  readonly isLoadingLookups = signal(false);

  readonly departments = signal<Department[]>([]);
  readonly designations = signal<Designation[]>([]);
  readonly managers = signal<Employee[]>([]);

  email = '';
  phone = '';

  departmentId: number | null = null;
  designationId: number | null = null;
  salary: number | null = null;
  joiningDate = '';
  employmentType = '';
  managerId: number | null = null;

  ngOnInit(): void {
    this.loadLookups();
  }

  cancel(): void {
    this.router.navigate(['/hiring']);
  }

  createOnboarding(): void {
    if (!this.email.trim()) {
      this.notificationService.error(
        'Email is required.'
      );

      return;
    }

    const request: CreateOnboardingRequest = {
      email: this.email.trim(),
      phone: this.phone.trim() || null,
      departmentId: this.departmentId,
      designationId: this.designationId,
      salary: this.salary,
      joiningDate: this.joiningDate || null,
      employmentType: this.employmentType || null,
      managerId: this.managerId,
      hiringBatchId: null
    };

    this.isSubmitting.set(true);

    this.onboardingService
      .createOnboarding(request)
      .pipe(
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            return;
          }

          this.notificationService.success(
            'Onboarding record created successfully.'
          );

          this.router.navigate([
            '/hiring/offers',
            response.data.id
          ]);
        }
      });
  }

  private loadLookups(): void {
    this.isLoadingLookups.set(true);

    this.hiringLookupService
      .getLookups()
      .pipe(
        finalize(() => this.isLoadingLookups.set(false))
      )
      .subscribe({
        next: lookups => {
          this.departments.set(
            lookups.departments
          );

          this.designations.set(
            lookups.designations
          );

          this.managers.set(
            lookups.managers
          );
        }
      });
  }
}