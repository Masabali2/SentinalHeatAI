import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

import { PayrollDto } from '../../../../models/payroll.models';

import { PayrollStatusBadge } from '../payroll-status-badge/payroll-status-badge';

@Component({
  selector: 'app-payroll-details',
  imports: [PayrollStatusBadge],
  templateUrl: './payroll-details.html',
  styleUrl: './payroll-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollDetails {
  readonly payroll = input.required<PayrollDto>();

  formatMonth(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('en-US', {
      month: 'long'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(date: string | null): string {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}