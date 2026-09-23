import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

import { PayrollItemDto } from '../../../../models/payroll.models';

@Component({
  selector: 'app-payroll-item-list',
  templateUrl: './payroll-item-list.html',
  styleUrl: './payroll-item-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollItemList {
  readonly items = input.required<PayrollItemDto[]>();

  readonly emptyMessage = input('No items added.');

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}