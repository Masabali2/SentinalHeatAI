import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { PayrollService } from '../../../../core/services/payroll.service';

import {
  CreateDeductionDto,
  DeductionDto
} from '../../../../models/payroll.models';

import { DeductionForm } from '../../components/deduction-form/deduction-form';

@Component({
  selector: 'app-deductions',
  imports: [DeductionForm],
  templateUrl: './deductions.html',
  styleUrl: './deductions.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Deductions implements OnInit {
  private readonly payrollService = inject(PayrollService);

  readonly deductions = signal<DeductionDto[]>([]);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly showForm = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadDeductions();
  }

  loadDeductions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.payrollService.getDeductions().subscribe({
      next: response => {
        if (response.success) {
          this.deductions.set(response.data ?? []);
        } else {
          this.errorMessage.set(
            response.message || 'Unable to load deductions.'
          );
        }

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load deductions. Please try again.'
        );

        this.isLoading.set(false);
      }
    });
  }

  openCreateForm(): void {
    this.errorMessage.set('');
    this.showForm.set(true);
  }

  closeCreateForm(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.showForm.set(false);
  }

  createDeduction(dto: CreateDeductionDto): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.payrollService.createDeduction(dto).subscribe({
      next: response => {
        if (response.success) {
          this.showForm.set(false);
          this.isSubmitting.set(false);
          this.loadDeductions();
          return;
        }

        this.errorMessage.set(
          response.message || 'Unable to create deduction.'
        );

        this.isSubmitting.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to create deduction. Please try again.'
        );

        this.isSubmitting.set(false);
      }
    });
  }
}