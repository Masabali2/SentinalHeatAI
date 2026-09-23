import {
  ChangeDetectionStrategy,
  Component,
  output
} from '@angular/core';

@Component({
  selector: 'app-payroll-header',
  templateUrl: './payroll-header.html',
  styleUrl: './payroll-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollHeader {
  readonly generatePayroll = output<void>();
}