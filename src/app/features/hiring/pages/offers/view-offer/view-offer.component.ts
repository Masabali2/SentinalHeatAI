import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';

import { OfferService } from '../../../../../core/services/offer.service';
import { OnboardingService } from '../../../../../core/services/onboarding.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { ApiResponse } from '../../../../../models/api-response.model';
import { Offer, OfferStatus } from '../../../models/offer.model';
import { Onboarding, OnboardingStatus } from '../../../models/onboarding.model';

@Component({
  selector: 'app-view-offer',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './view-offer.component.html',
  styleUrl: './view-offer.component.css'
})
export class ViewOfferComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly offerService = inject(OfferService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly notificationService = inject(NotificationService);

  readonly offer = signal<Offer | null>(null);
  readonly onboarding = signal<Onboarding | null>(null);
  readonly isLoading = signal(false);
  readonly isSending = signal(false);
  readonly isResending = signal(false);
  readonly OfferStatus = OfferStatus;

  onboardingId = 0;

  ngOnInit(): void {
    this.onboardingId = Number(this.route.snapshot.paramMap.get('onboardingId'));
    const offerId = Number(this.route.snapshot.paramMap.get('offerId'));

    if (!this.onboardingId || !offerId) {
      this.notificationService.error('Invalid offer reference.');
      this.back();
      return;
    }

    this.isLoading.set(true);
    this.offerService.getById(offerId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          if (response.success && response.data) {
            this.offer.set(response.data);
            this.markOfferAsViewed(response.data.id, response.data.status);
            this.loadOnboarding(response.data.employeeOnboardingId);
            return;
          }

          this.notificationService.error(response.message || 'Unable to load offer.');
        },
        error: error => {
          this.notificationService.error(
            error?.error?.message || 'Unable to load offer.'
          );
        }
      });
  }

  back(): void {
    if (this.onboardingId) {
      this.router.navigate(['/hiring/offers', this.onboardingId]);
      return;
    }

    this.router.navigate(['/hiring']);
  }

  editOffer(): void {
    const offer = this.offer();
    if (offer?.status === OfferStatus.Draft) {
      this.router.navigate(['/hiring/offers', this.onboardingId, 'edit', offer.id]);
    }
  }

  sendOffer(): void {
    const offer = this.offer();

    if (!offer) {
      this.notificationService.error('No offer is available to send.');
      return;
    }

    if (offer.status !== OfferStatus.Draft) {
      this.notificationService.warning('Only draft offers can be sent.');
      return;
    }

    this.isSending.set(true);

    this.offerService.send(offer.id)
      .pipe(finalize(() => this.isSending.set(false)))
      .subscribe({
        next: response => {
          if (!response.success) {
            return;
          }

          this.offer.update(current => current ? { ...current, status: OfferStatus.Sent, sentAt: current.sentAt ?? new Date().toISOString() } : current);
          this.notificationService.success(response.message || 'Offer sent successfully.');
        },
        error: error => {
          this.notificationService.error(
            error?.error?.message || 'Unable to send the offer.'
          );
        }
      });
  }

  getStatusLabel(status: OfferStatus): string {
    return OfferStatus[status] || 'Unknown';
  }

  getOnboardingStatusLabel(status: OnboardingStatus): string {
    return OnboardingStatus[status] || 'Unknown';
  }

  canResendRegistration(): boolean {
    const status = this.onboarding()?.status;

    return status === OnboardingStatus.OfferAccepted ||
      status === OnboardingStatus.ProfileIncomplete;
  }

  canResendVerification(): boolean {
    return this.onboarding()?.status === OnboardingStatus.EmailVerificationPending;
  }

  resendRegistrationEmail(): void {
    const onboarding = this.onboarding();

    if (!onboarding || !this.canResendRegistration()) {
      return;
    }

    this.resendEmail(
      this.onboardingService.resendRegistrationEmail(onboarding.id),
      'A new registration email has been sent successfully.'
    );
  }

  resendVerificationEmail(): void {
    const onboarding = this.onboarding();

    if (!onboarding || !this.canResendVerification()) {
      return;
    }

    this.resendEmail(
      this.onboardingService.resendVerificationEmail(onboarding.id),
      'A new verification code has been sent successfully.'
    );
  }

  private markOfferAsViewed(
    offerId: number,
    status: OfferStatus
  ): void {
    if (status !== OfferStatus.Sent) {
      return;
    }

    this.offerService.markAsViewed(offerId).subscribe({
      next: response => {
        if (response.success && response.data) {
          this.offer.set(response.data);
        }
      },
      error: error => {
        this.notificationService.error(
          error?.error?.message || 'Unable to mark the offer as viewed.'
        );
      }
    });
  }

  private resendEmail(
    request: Observable<ApiResponse<string>>,
    successMessage: string
  ): void {
    if (this.isResending()) {
      return;
    }

    this.isResending.set(true);

    request
      .pipe(finalize(() => this.isResending.set(false)))
      .subscribe({
        next: response => {
          if (!response.success) {
            this.notificationService.error(
              response.message || 'Unable to resend the email.'
            );
            return;
          }

          this.notificationService.success(
            response.message || successMessage
          );
        },
        error: error => {
          const errorBody = error?.error;
          const message = typeof errorBody === 'string'
            ? errorBody
            : errorBody?.message || errorBody?.Message;

          this.notificationService.error(
            message || 'Unable to resend the email.'
          );
        }
      });
  }

  private loadOnboarding(onboardingId: number): void {
    this.onboardingService.getById(onboardingId).subscribe({
      next: response => {
        if (response.success && response.data) {
          this.onboarding.set(response.data);
          return;
        }

        this.notificationService.error(
          response.message || 'Unable to load candidate details.'
        );
      },
      error: () => this.notificationService.error('Unable to load candidate details.')
    });
  }
}