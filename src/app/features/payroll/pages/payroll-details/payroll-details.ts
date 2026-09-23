import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PayrollService } from '../../../../core/services/payroll.service';

import { PayrollDto } from '../../../../models/payroll.models';

import { PayrollDetails as PayrollDetailsComponent } from '../../components/payroll-details/payroll-details';

@Component({
  selector: 'app-payroll-details-page',
  imports: [PayrollDetailsComponent],
  templateUrl: './payroll-details.html',
  styleUrl: './payroll-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly payrollService = inject(PayrollService);

  readonly payroll = signal<PayrollDto | null>(null);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.loadPayroll();
  }

  private loadPayroll(): void {
    const payrollId = Number(
      this.route.snapshot.paramMap.get('payrollId')
    );

    if (!payrollId) {
      this.errorMessage.set('Invalid payroll ID.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.payrollService.getById(payrollId).subscribe({
      next: response => {
        if (response.success && response.data) {
          this.payroll.set(response.data);
        } else {
          this.errorMessage.set(
            response.message || 'Payroll record not found.'
          );
        }

        this.isLoading.set(false);
      },

      error: () => {
        this.errorMessage.set(
          'Unable to load payroll details. Please try again.'
        );

        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/payroll']);
  }

  retry(): void {
    this.loadPayroll();
  }
}