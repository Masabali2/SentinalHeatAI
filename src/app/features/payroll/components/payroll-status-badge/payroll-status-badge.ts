import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';


import { PayrollStatus } from '../../../../models/payroll.models';

@Component({
  selector: 'app-payroll-status-badge',
  templateUrl: './payroll-status-badge.html',
  styleUrl: './payroll-status-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollStatusBadge {
  readonly status = input.required<PayrollStatus>();

  readonly statusLabel = computed(() => {
    switch (this.status()) {
      case PayrollStatus.Draft:
        return 'Draft';

      case PayrollStatus.Processing:
        return 'Processing';

      case PayrollStatus.Processed:
        return 'Processed';

      case PayrollStatus.Paid:
        return 'Paid';

      case PayrollStatus.Cancelled:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  });

  readonly statusClass = computed(() => {
    switch (this.status()) {
      case PayrollStatus.Draft:
        return 'status-draft';

      case PayrollStatus.Processing:
        return 'status-processing';

      case PayrollStatus.Processed:
        return 'status-processed';

      case PayrollStatus.Paid:
        return 'status-paid';

      case PayrollStatus.Cancelled:
        return 'status-cancelled';

      default:
        return 'status-unknown';
    }
  });
}