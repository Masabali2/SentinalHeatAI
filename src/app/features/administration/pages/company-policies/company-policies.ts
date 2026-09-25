import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';

import { Router } from '@angular/router';

import { PayrollService } from '../../../../core/services/payroll.service';

import {
  AllowanceDto,
  CreateAllowanceDto,
  CreateDeductionDto,
  DeductionDto
} from '../../../../models/payroll.models';

import { AllowanceForm } from '../../../payroll/components/allowance-form/allowance-form';
import { DeductionForm } from '../../../payroll/components/deduction-form/deduction-form';

@Component({
  selector: 'app-company-policies',
  imports: [
    AllowanceForm,
    DeductionForm
  ],
  templateUrl: './company-policies.html',
  styleUrl: './company-policies.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyPolicies
  implements OnInit, AfterViewChecked {

  private readonly payrollService = inject(PayrollService);
  private readonly router = inject(Router);

  @ViewChild('confirmationDialog')
  private confirmationDialog?: ElementRef<HTMLDivElement>;

  readonly allowances = signal<AllowanceDto[]>([]);
  readonly deductions = signal<DeductionDto[]>([]);

  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);

  readonly errorMessage = signal('');

  readonly showAllowanceForm = signal(false);
  readonly showDeductionForm = signal(false);

  readonly showConfirmationModal = signal(false);

  readonly confirmationType =
    signal<'activate' | 'deactivate' | null>(null);

  readonly selectedAllowance =
    signal<AllowanceDto | null>(null);

  readonly selectedDeduction =
    signal<DeductionDto | null>(null);

  private previousFocusedElement: HTMLElement | null = null;

  private confirmationFocused = false;

  ngOnInit(): void {
    this.loadPolicies();
  }

  ngAfterViewChecked(): void {
    if (
      this.showConfirmationModal() &&
      !this.confirmationFocused &&
      this.confirmationDialog
    ) {
      this.confirmationFocused = true;

      setTimeout(() => {
        this.confirmationDialog?.nativeElement.focus();
      });
    }

    if (!this.showConfirmationModal()) {
      this.confirmationFocused = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.showConfirmationModal()) {
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.closeConfirmationModal();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.showConfirmationModal() || event.key !== 'Tab') {
      return;
    }

    const modalElement = this.confirmationDialog?.nativeElement;

    if (!modalElement) {
      return;
    }

    const focusableElements = modalElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement || document.activeElement === modalElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private loadPolicies(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    let allowancesLoaded = false;
    let deductionsLoaded = false;

    this.payrollService.getAllowances().subscribe({
      next: response => {
        if (response.success) {
          this.allowances.set(
            response.data ?? []
          );
        } else {
          this.errorMessage.set(
            response.message ||
            'Unable to load allowances.'
          );
        }

        allowancesLoaded = true;

        if (deductionsLoaded) {
          this.isLoading.set(false);
        }
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load company policies. Please try again.'
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
          this.deductions.set(
            response.data ?? []
          );
        } else if (!this.errorMessage()) {
          this.errorMessage.set(
            response.message ||
            'Unable to load deductions.'
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
            'Unable to load company policies. Please try again.'
          );
        }

        deductionsLoaded = true;

        if (allowancesLoaded) {
          this.isLoading.set(false);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/administration']);
  }

  openAllowanceForm(): void {
    this.errorMessage.set('');
    this.showAllowanceForm.set(true);
  }

  closeAllowanceForm(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.showAllowanceForm.set(false);
  }

  createAllowance(
    dto: CreateAllowanceDto
  ): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.payrollService
      .createAllowance(dto)
      .subscribe({
        next: response => {
          if (response.success) {
            this.showAllowanceForm.set(false);
            this.isSubmitting.set(false);

            this.loadPolicies();

            return;
          }

          this.errorMessage.set(
            response.message ||
            'Unable to create allowance.'
          );

          this.isSubmitting.set(false);
        },

        error: error => {
          this.errorMessage.set(
            error?.error?.message ||
            'Unable to create allowance. Please try again.'
          );

          this.isSubmitting.set(false);
        }
      });
  }

  openDeductionForm(): void {
    this.errorMessage.set('');
    this.showDeductionForm.set(true);
  }

  closeDeductionForm(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.showDeductionForm.set(false);
  }

  createDeduction(
    dto: CreateDeductionDto
  ): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.payrollService
      .createDeduction(dto)
      .subscribe({
        next: response => {
          if (response.success) {
            this.showDeductionForm.set(false);
            this.isSubmitting.set(false);

            this.loadPolicies();

            return;
          }

          this.errorMessage.set(
            response.message ||
            'Unable to create deduction.'
          );

          this.isSubmitting.set(false);
        },

        error: error => {
          this.errorMessage.set(
            error?.error?.message ||
            'Unable to create deduction. Please try again.'
          );

          this.isSubmitting.set(false);
        }
      });
  }

  deleteAllowance(
    allowance: AllowanceDto
  ): void {
    this.previousFocusedElement =
      document.activeElement as HTMLElement;

    this.selectedAllowance.set(allowance);
    this.selectedDeduction.set(null);

    this.confirmationType.set('deactivate');

    this.showConfirmationModal.set(true);
  }

  activateAllowance(
    allowance: AllowanceDto
  ): void {
    this.previousFocusedElement =
      document.activeElement as HTMLElement;

    this.selectedAllowance.set(allowance);
    this.selectedDeduction.set(null);

    this.confirmationType.set('activate');

    this.showConfirmationModal.set(true);
  }

  deleteDeduction(
    deduction: DeductionDto
  ): void {
    this.previousFocusedElement =
      document.activeElement as HTMLElement;

    this.selectedDeduction.set(deduction);
    this.selectedAllowance.set(null);

    this.confirmationType.set('deactivate');

    this.showConfirmationModal.set(true);
  }

  activateDeduction(
    deduction: DeductionDto
  ): void {
    this.previousFocusedElement =
      document.activeElement as HTMLElement;

    this.selectedDeduction.set(deduction);
    this.selectedAllowance.set(null);

    this.confirmationType.set('activate');

    this.showConfirmationModal.set(true);
  }

  closeConfirmationModal(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.showConfirmationModal.set(false);

    this.confirmationType.set(null);

    this.selectedAllowance.set(null);

    this.selectedDeduction.set(null);

    setTimeout(() => {
      this.previousFocusedElement?.focus();

      this.previousFocusedElement = null;
    });
  }

  confirmPolicyAction(): void {
    if (this.isSubmitting()) {
      return;
    }

    const type = this.confirmationType();

    if (type === 'activate') {
      const allowance =
        this.selectedAllowance();

      if (allowance) {
        this.performActivateAllowance(
          allowance
        );

        return;
      }

      const deduction =
        this.selectedDeduction();

      if (deduction) {
        this.performActivateDeduction(
          deduction
        );

        return;
      }

      return;
    }

    if (type === 'deactivate') {
      const allowance =
        this.selectedAllowance();

      if (allowance) {
        this.performDeactivateAllowance(
          allowance
        );

        return;
      }

      const deduction =
        this.selectedDeduction();

      if (deduction) {
        this.performDeactivateDeduction(
          deduction
        );
      }
    }
  }

  private performActivateAllowance(
    allowance: AllowanceDto
  ): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.showConfirmationModal.set(false);
    this.confirmationType.set(null);

    this.selectedAllowance.set(null);
    this.selectedDeduction.set(null);

    this.payrollService
      .activateAllowance(allowance.id)
      .subscribe({
        next: response => {
          if (response.success) {
            this.isSubmitting.set(false);

            this.loadPolicies();

            return;
          }

          this.errorMessage.set(
            response.message ||
            'Failed to activate allowance.'
          );

          this.isSubmitting.set(false);
        },

        error: error => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to activate allowance.'
          );
        }
      });
  }

  private performDeactivateAllowance(
    allowance: AllowanceDto
  ): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.showConfirmationModal.set(false);
    this.confirmationType.set(null);

    this.selectedAllowance.set(null);
    this.selectedDeduction.set(null);

    this.payrollService
      .deleteAllowance(allowance.id)
      .subscribe({
        next: response => {
          if (response.success) {
            this.isSubmitting.set(false);

            this.loadPolicies();

            return;
          }

          this.errorMessage.set(
            response.message ||
            'Failed to deactivate allowance.'
          );

          this.isSubmitting.set(false);
        },

        error: error => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to deactivate allowance.'
          );
        }
      });
  }

  private performActivateDeduction(
    deduction: DeductionDto
  ): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.showConfirmationModal.set(false);
    this.confirmationType.set(null);

    this.selectedAllowance.set(null);
    this.selectedDeduction.set(null);

    this.payrollService
      .activateDeduction(deduction.id)
      .subscribe({
        next: response => {
          if (response.success) {
            this.isSubmitting.set(false);

            this.loadPolicies();

            return;
          }

          this.errorMessage.set(
            response.message ||
            'Failed to activate deduction.'
          );

          this.isSubmitting.set(false);
        },

        error: error => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to activate deduction.'
          );
        }
      });
  }

  private performDeactivateDeduction(
    deduction: DeductionDto
  ): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.showConfirmationModal.set(false);
    this.confirmationType.set(null);

    this.selectedAllowance.set(null);
    this.selectedDeduction.set(null);

    this.payrollService
      .deleteDeduction(deduction.id)
      .subscribe({
        next: response => {
          if (response.success) {
            this.isSubmitting.set(false);

            this.loadPolicies();

            return;
          }

          this.errorMessage.set(
            response.message ||
            'Failed to deactivate deduction.'
          );

          this.isSubmitting.set(false);
        },

        error: error => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            error?.error?.message ||
            'Failed to deactivate deduction.'
          );
        }
      });
  }

  retry(): void {
    this.loadPolicies();
  }
}