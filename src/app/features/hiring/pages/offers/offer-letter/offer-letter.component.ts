
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { OnboardingService } from '../../../../../core/services/onboarding.service';
import { OfferService } from '../../../../../core/services/offer.service';
import { NotificationService } from '../../../../../core/services/notification.service';

import {
  Onboarding,
  OnboardingStatus
} from '../../../models/onboarding.model';

import {
  Offer,
  OfferStatus
} from '../../../models/offer.model';

@Component({
  selector: 'app-offer-letter',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './offer-letter.component.html',
  styleUrl: './offer-letter.component.css'
})
export class OfferLetterComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly onboardingService =
    inject(OnboardingService);

  private readonly offerService =
    inject(OfferService);

  private readonly notificationService =
    inject(NotificationService);

  readonly onboarding =
    signal<Onboarding | null>(null);

  readonly offer =
    signal<Offer | null>(null);

  readonly isLoading =
    signal(false);

  readonly isCreating =
    signal(false);

  readonly isSending =
    signal(false);

  readonly showCreatedModal =
    signal(false);

  readonly showSendConfirmationModal =
    signal(false);

  readonly OfferStatus =
    OfferStatus;

  onboardingId = 0;

  expiresAt = '';

  ngOnInit(): void {

    this.onboardingId = Number(
      this.route.snapshot.paramMap.get(
        'onboardingId'
      )
    );

    if (!this.onboardingId) {

      this.router.navigate(['/hiring']);

      return;
    }

    this.loadOnboarding();
  }

  back(): void {

    this.router.navigate([
      '/hiring/offers',
      this.onboardingId
    ]);
  }

  goToHiringDashboard(): void {

    this.router.navigate([
      '/hiring'
    ]);
  }

  createOffer(): void {

    const onboarding = this.onboarding();

    if (!onboarding) {
      return;
    }

    if (!this.expiresAt) {

      this.notificationService.error(
        'Please select an offer expiry date.'
      );

      return;
    }

    const expiryDate =
      new Date(this.expiresAt);

    if (expiryDate <= new Date()) {

      this.notificationService.error(
        'Offer expiry must be in the future.'
      );

      return;
    }

    this.isCreating.set(true);

    this.offerService
      .create({
        employeeOnboardingId:
          onboarding.id,

        expiresAt:
          expiryDate.toISOString()
      })
      .pipe(
        finalize(() =>
          this.isCreating.set(false)
        )
      )
      .subscribe({

        next: response => {

          if (
            !response.success ||
            !response.data
          ) {
            return;
          }

          this.offer.set(
            response.data
          );

          this.showCreatedModal.set(
            true
          );
        }

      });
  }

  closeCreatedModal(): void {

    this.showCreatedModal.set(false);
  }

  reviewAndSend(): void {

    this.showCreatedModal.set(false);

    const offer = this.offer();

    if (!offer) {
      return;
    }

    if (offer.status !== OfferStatus.Draft) {

      this.notificationService.warning(
        'Only draft offers can be sent.'
      );

      return;
    }

    this.openSendConfirmation();
  }

  openSendConfirmation(): void {

    const offer = this.offer();

    if (!offer) {

      this.notificationService.error(
        'No offer is available to send.'
      );

      return;
    }

    if (offer.status !== OfferStatus.Draft) {

      this.notificationService.warning(
        'Only draft offers can be sent.'
      );

      return;
    }

    this.showSendConfirmationModal.set(
      true
    );
  }

  closeSendConfirmation(): void {

    this.showSendConfirmationModal.set(
      false
    );
  }

  sendOffer(): void {

    const offer = this.offer();

    if (!offer) {

      this.notificationService.error(
        'No offer is available to send.'
      );

      return;
    }

    if (offer.status !== OfferStatus.Draft) {

      this.notificationService.warning(
        'Only draft offers can be sent.'
      );

      return;
    }

    if (this.isSending()) {
      return;
    }

    this.isSending.set(true);

    this.offerService
      .send(offer.id)
      .pipe(
        finalize(() =>
          this.isSending.set(false)
        )
      )
      .subscribe({

        next: response => {

          if (
            !response.success
          ) {
            return;
          }

          this.showSendConfirmationModal.set(
            false
          );

          this.offer.update(
            currentOffer => {

              if (!currentOffer) {
                return currentOffer;
              }

              return {
                ...currentOffer,
                status: OfferStatus.Sent,
                sentAt:
                  currentOffer.sentAt ??
                  new Date().toISOString()
              };

            }
          );

          this.notificationService.success(
            response.message ||
            'Offer email queued successfully.'
          );

          setTimeout(() => {

            this.router.navigate([
              '/hiring/offers',
              this.onboardingId
            ]);

          }, 1000);

        }

      });
  }

  getStatusLabel(
    status: OnboardingStatus
  ): string {

    switch (status) {

      case OnboardingStatus.Created:
        return 'Created';

      case OnboardingStatus.OfferPending:
        return 'Offer Pending';

      case OnboardingStatus.OfferAccepted:
        return 'Offer Accepted';

      case OnboardingStatus.ProfileIncomplete:
        return 'Profile Incomplete';

      case OnboardingStatus.ProfileSubmitted:
        return 'Profile Submitted';

      case OnboardingStatus.ValidationFailed:
        return 'Validation Failed';

      case OnboardingStatus.EmailVerificationPending:
        return 'Email Verification';

      case OnboardingStatus.EmailVerified:
        return 'Email Verified';

      case OnboardingStatus.Completed:
        return 'Completed';

      case OnboardingStatus.Cancelled:
        return 'Cancelled';

      default:
        return 'In Progress';
    }
  }

  private loadOnboarding(): void {

    this.isLoading.set(true);

    this.onboardingService
      .getById(
        this.onboardingId
      )
      .pipe(
        finalize(() =>
          this.isLoading.set(false)
        )
      )
      .subscribe({

        next: response => {

          if (
            !response.success ||
            !response.data
          ) {
            return;
          }

          this.onboarding.set(
            response.data
          );
        }

      });
  }
}
