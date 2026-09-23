import {
  ChangeDetectionStrategy,
  Component,
  input
} from '@angular/core';

@Component({
  selector: 'app-payroll-stat-card',
  templateUrl: './payroll-stat-card.html',
  styleUrl: './payroll-stat-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollStatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly description = input<string>('');
}