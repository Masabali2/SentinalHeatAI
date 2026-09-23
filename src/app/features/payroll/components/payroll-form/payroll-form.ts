import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../../../../core/services/employee.service';

import { Employee } from '../../../../models/employee.model';

import {
  AllowanceDto,
  DeductionDto,
  GeneratePayrollDto
} from '../../../../models/payroll.models';

@Component({
  selector: 'app-payroll-form',
  imports: [FormsModule],
  templateUrl: './payroll-form.html',
  styleUrl: './payroll-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollForm implements OnInit {
  private readonly employeeService = inject(EmployeeService);

  readonly allowances = input.required<AllowanceDto[]>();
  readonly deductions = input.required<DeductionDto[]>();
  readonly isSubmitting = input(false);

  readonly submit = output<GeneratePayrollDto>();
  readonly cancel = output<void>();

  readonly employees = signal<Employee[]>([]);
  readonly isLoadingEmployees = signal(false);
  readonly employeeError = signal('');

  employeeId: number | null = null;
  year: number | null = null;
  month: number | null = null;

  allowanceItems: {
    allowanceId: number | null;
    amount: number | null;
  }[] = [];

  deductionItems: {
    deductionId: number | null;
    amount: number | null;
  }[] = [];

  readonly months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.isLoadingEmployees.set(true);
    this.employeeError.set('');

    this.employeeService.getAll().subscribe({
      next: response => {
        if (response.success) {
          this.employees.set(response.data ?? []);
        } else {
          this.employeeError.set(
            response.message || 'Unable to load employees.'
          );
        }

        this.isLoadingEmployees.set(false);
      },

      error: () => {
        this.employeeError.set(
          'Unable to load employees. Please try again.'
        );

        this.isLoadingEmployees.set(false);
      }
    });
  }

  addAllowance(): void {
    this.allowanceItems.push({
      allowanceId: null,
      amount: null
    });
  }

  removeAllowance(index: number): void {
    this.allowanceItems.splice(index, 1);
  }

  addDeduction(): void {
    this.deductionItems.push({
      deductionId: null,
      amount: null
    });
  }

  removeDeduction(index: number): void {
    this.deductionItems.splice(index, 1);
  }

  isValid(): boolean {
    if (
      !this.employeeId ||
      !this.year ||
      !this.month
    ) {
      return false;
    }

    const allowancesValid = this.allowanceItems.every(
      item =>
        !!item.allowanceId &&
        item.amount !== null &&
        item.amount > 0
    );

    const deductionsValid = this.deductionItems.every(
      item =>
        !!item.deductionId &&
        item.amount !== null &&
        item.amount > 0
    );

    return allowancesValid && deductionsValid;
  }
readonly years = Array.from(
  { length: 6 },
  (_, index) => new Date().getFullYear() + index
);
  submitForm(): void {
    if (!this.isValid() || this.isSubmitting()) {
      return;
    }

    const dto: GeneratePayrollDto = {
      employeeId: this.employeeId!,
      year: this.year!,
      month: this.month!,
      allowances: this.allowanceItems.map(item => ({
        allowanceId: item.allowanceId!,
        amount: item.amount!
      })),
      deductions: this.deductionItems.map(item => ({
        deductionId: item.deductionId!,
        amount: item.amount!
      }))
    };

    this.submit.emit(dto);
  }
}