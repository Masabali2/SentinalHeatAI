import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import {
  PayrollListDto,
  PayrollStatus
} from '../../../../models/payroll.models';

import { PayrollStatusBadge } from '../payroll-status-badge/payroll-status-badge';

@Component({
  selector: 'app-payroll-table',
  imports: [PayrollStatusBadge],
  templateUrl: './payroll-table.html',
  styleUrl: './payroll-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollTable {
  readonly payrolls = input.required<PayrollListDto[]>();

  readonly view = output<number>();

  readonly process = output<number>();

  readonly markAsPaid = output<number>();

  readonly PayrollStatus = PayrollStatus;

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
}

