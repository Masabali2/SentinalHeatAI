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
  PayrollListDto,
  PayrollStatus
} from '../../../../models/payroll.models';

import {
  PayrollFilter,
  PayrollFilterValue
} from '../../components/payroll-filter/payroll-filter';

import { PayrollHeader } from '../../components/payroll-header/payroll-header';
import { PayrollStatCard } from '../../components/payroll-stat-card/payroll-stat-card';
import { PayrollTable } from '../../components/payroll-table/payroll-table';

@Component({
  selector: 'app-payroll-dashboard',
  imports: [
    PayrollHeader,
    PayrollStatCard,
    PayrollFilter,
    PayrollTable
  ],
  templateUrl: './payroll-dashboard.html',
  styleUrl: './payroll-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollDashboard implements OnInit {
  private readonly payrollService = inject(PayrollService);
  private readonly router = inject(Router);

  readonly payrolls = signal<PayrollListDto[]>([]);
  readonly filteredPayrolls = signal<PayrollListDto[]>([]);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly totalPayrolls = signal(0);
  readonly draftPayrolls = signal(0);
  readonly processedPayrolls = signal(0);
  readonly paidPayrolls = signal(0);

  ngOnInit(): void {
    this.loadPayrolls();
  }

  loadPayrolls(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.payrollService.getAll().subscribe({
      next: response => {
        if (response.success) {
          const records = response.data ?? [];

          this.payrolls.set(records);
          this.filteredPayrolls.set(records);
          this.calculateStatistics(records);
        } else {
          this.errorMessage.set(
            response.message || 'Unable to load payroll records.'
          );
        }

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load payroll records. Please try again.'
        );

        this.isLoading.set(false);
      }
    });
  }

  applyFilters(filters: PayrollFilterValue): void {
    const search = filters.search.trim().toLowerCase();

    const filtered = this.payrolls().filter(payroll => {

      const matchesSearch =
        !search ||
        payroll.employeeName.toLowerCase().includes(search);

      const matchesYear =
        filters.year === null ||
        payroll.year === filters.year;

      const matchesMonth =
        filters.month === null ||
        payroll.month === filters.month;

      const matchesStatus =
        filters.status === null ||
        payroll.status === filters.status;

      return (
        matchesSearch &&
        matchesYear &&
        matchesMonth &&
        matchesStatus
      );
    });

    this.filteredPayrolls.set(filtered);
  }

  clearFilters(): void {
    this.filteredPayrolls.set(this.payrolls());
  }

  private calculateStatistics(payrolls: PayrollListDto[]): void {
    this.totalPayrolls.set(payrolls.length);

    this.draftPayrolls.set(
      payrolls.filter(
        payroll => payroll.status === PayrollStatus.Draft
      ).length
    );

    this.processedPayrolls.set(
      payrolls.filter(
        payroll => payroll.status === PayrollStatus.Processed
      ).length
    );

    this.paidPayrolls.set(
      payrolls.filter(
        payroll => payroll.status === PayrollStatus.Paid
      ).length
    );
  }

  navigateToGenerate(): void {
    this.router.navigate(['/payroll/generate']);
  }

  viewPayroll(payrollId: number): void {
    this.router.navigate(['/payroll', payrollId]);
  }

  processPayroll(payrollId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.payrollService.processPayroll(payrollId).subscribe({
      next: response => {
        if (response.success) {
          this.loadPayrolls();
          return;
        }

        this.errorMessage.set(
          response.message || 'Unable to process payroll.'
        );

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to process payroll. Please try again.'
        );

        this.isLoading.set(false);
      }
    });
  }

  markAsPaid(payrollId: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.payrollService.markAsPaid(payrollId).subscribe({
      next: response => {
        if (response.success) {
          this.loadPayrolls();
          return;
        }

        this.errorMessage.set(
          response.message || 'Unable to mark payroll as paid.'
        );

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to mark payroll as paid. Please try again.'
        );

        this.isLoading.set(false);
      }
    });
  }
}