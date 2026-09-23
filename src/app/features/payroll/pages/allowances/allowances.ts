import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { PayrollService } from '../../../../core/services/payroll.service';

import {
  AllowanceDto,
  CreateAllowanceDto
} from '../../../../models/payroll.models';

import { AllowanceForm } from '../../components/allowance-form/allowance-form';

@Component({
  selector: 'app-allowances',
  imports: [AllowanceForm],
  templateUrl: './allowances.html',
  styleUrl: './allowances.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Allowances implements OnInit {
  private readonly payrollService = inject(PayrollService);

  readonly allowances = signal<AllowanceDto[]>([]);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly showForm = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadAllowances();
  }

  loadAllowances(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.payrollService.getAllowances().subscribe({
      next: response => {
        if (response.success) {
          this.allowances.set(response.data ?? []);
        } else {
          this.errorMessage.set(
            response.message || 'Unable to load allowances.'
          );
        }

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load allowances. Please try again.'
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

  createAllowance(dto: CreateAllowanceDto): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.payrollService.createAllowance(dto).subscribe({
      next: response => {
        if (response.success) {
          this.showForm.set(false);
          this.isSubmitting.set(false);
          this.loadAllowances();
          return;
        }

        this.errorMessage.set(
          response.message || 'Unable to create allowance.'
        );

        this.isSubmitting.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to create allowance. Please try again.'
        );

        this.isSubmitting.set(false);
      }
    });
  }
}