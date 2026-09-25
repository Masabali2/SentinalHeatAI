import {
  ChangeDetectionStrategy,
  Component,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PayrollStatus } from '../../../../models/payroll.models';

export interface PayrollFilterValue {
  search: string;
  year: number | null;
  month: number | null;
  status: PayrollStatus | null;
}

@Component({
  selector: 'app-payroll-filter',
  imports: [FormsModule],
  templateUrl: './payroll-filter.html',
  styleUrl: './payroll-filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollFilter {
  readonly filterChange = output<PayrollFilterValue>();

  readonly clear = output<void>();

  readonly statuses = [
    { value: PayrollStatus.Draft, label: 'Draft' },
    { value: PayrollStatus.Processing, label: 'Processing' },
    { value: PayrollStatus.Processed, label: 'Processed' },
    { value: PayrollStatus.Paid, label: 'Paid' },
    { value: PayrollStatus.Cancelled, label: 'Cancelled' }
  ];

  filter: PayrollFilterValue = {
    search: '',
    year: null,
    month: null,
    status: null
  };

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
readonly markAllAsPaid = output<void>();
  applyFilters(): void {
    this.filterChange.emit({
      ...this.filter
    });
  }

  clearFilters(): void {
    this.filter = {
      search: '',
      year: null,
      month: null,
      status: null
    };

    this.clear.emit();
    this.filterChange.emit({
      ...this.filter
    });
  }
}