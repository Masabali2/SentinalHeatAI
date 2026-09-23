import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { Router } from '@angular/router';

import { PayrollService } from '../../../../core/services/payroll.service';

import {
  AllowanceDto,
  DeductionDto,
  GeneratePayrollDto
} from '../../../../models/payroll.models';

import { PayrollForm } from '../../components/payroll-form/payroll-form';

@Component({
  selector: 'app-generate-payroll',
  imports: [PayrollForm],
  templateUrl: './generate-payroll.html',
  styleUrl: './generate-payroll.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneratePayroll implements OnInit {
  private readonly payrollService = inject(PayrollService);
  private readonly router = inject(Router);

  readonly allowances = signal<AllowanceDto[]>([]);
  readonly deductions = signal<DeductionDto[]>([]);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadPayrollOptions();
  }

  private loadPayrollOptions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    let allowancesLoaded = false;
    let deductionsLoaded = false;

    this.payrollService.getAllowances().subscribe({
      next: response => {
        if (response.success) {
          this.allowances.set(response.data ?? []);
        } else {
          this.errorMessage.set(
            response.message || 'Unable to load allowances.'
          );
        }

        allowancesLoaded = true;

        if (deductionsLoaded) {
          this.isLoading.set(false);
        }
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load payroll options. Please try again.'
        );

        allowancesLoaded = true;

        if (deductionsLoaded) {
          this.isLoading.set(false);
        }
      }
    });

    this.payrollService.getDeductions().subscribe({
      next: response => {
        if (response.success) {
          this.deductions.set(response.data ?? []);
        } else if (!this.errorMessage()) {
          this.errorMessage.set(
            response.message || 'Unable to load deductions.'
          );
        }

        deductionsLoaded = true;

        if (allowancesLoaded) {
          this.isLoading.set(false);
        }
      },

      error: () => {
        if (!this.errorMessage()) {
          this.errorMessage.set(
            'Unable to load payroll options. Please try again.'
          );
        }

        deductionsLoaded = true;

        if (allowancesLoaded) {
          this.isLoading.set(false);
        }
      }
    });
  }

  generatePayroll(dto: GeneratePayrollDto): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.payrollService.generatePayroll(dto).subscribe({
      next: response => {
        if (response.success) {
          this.router.navigate(['/payroll']);
          return;
        }

        this.errorMessage.set(
          response.message || 'Unable to generate payroll.'
        );

        this.isSubmitting.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to generate payroll. Please try again.'
        );

        this.isSubmitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/payroll']);
  }

  retry(): void {
    this.loadPayrollOptions();
  }
}