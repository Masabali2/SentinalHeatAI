
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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
  OfferStatus,
  UpdateOfferRequest
} from '../../../models/offer.model';

@Component({
  selector: 'app-offer-letter',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe
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

  readonly isEditMode = signal(false);

  readonly OfferStatus =
    OfferStatus;

  onboardingId = 0;
  offerId = 0;

  salary = 0;
  departmentName = '';
  designationName = '';
  employmentType = '';
  joiningDate = '';
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

    this.offerId = Number(
      this.route.snapshot.paramMap.get('offerId')
    );
    this.isEditMode.set(!!this.offerId);

    this.loadOnboarding();
    if (this.offerId) {
      this.loadOffer();
    }
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

    if (this.isCreating()) {
      return;
    }

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

    const expiryDate = new Date(this.expiresAt);

    if (Number.isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      this.notificationService.error(
        'Offer expiry must be a valid future date.'
      );
      return;
    }

    if (!this.departmentName.trim() || !this.designationName.trim()) {
      this.notificationService.error(
        'Department and designation are required.'
      );
      return;
    }

    const request = this.buildOfferRequest(expiryDate.toISOString());

    this.isCreating.set(true);

    const action$ = this.isEditMode()
      ? this.offerService.update(this.offerId, request)
      : this.offerService.create({
          employeeOnboardingId: onboarding.id,
          expiresAt: request.expiresAt
        });

    action$
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            return;
          }

          this.offer.set(response.data);
          this.syncOfferForm(response.data);

          this.notificationService.success(
            this.isEditMode()
              ? 'Offer updated successfully.'
              : 'Offer created successfully.'
          );

          if (!this.isEditMode()) {
            this.showCreatedModal.set(true);
          }
        },
        error: error => {
          const errorBody = error?.error;
          const message = typeof errorBody === 'string'
            ? errorBody
            : errorBody?.message;

          this.notificationService.error(
            message ||
            (this.isEditMode()
              ? 'Unable to update the offer.'
              : 'Unable to create the offer.')
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

          this.isEditMode()
            ? this.syncOfferForm(this.offer())
            : this.syncOfferFormFromOnboarding(response.data);
        }

      });
  }

  private loadOffer(): void {
    this.offerService
      .getById(this.offerId)
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.notificationService.error(response.message || 'Unable to load offer.');
            return;
          }

          this.offer.set(response.data);
          this.syncOfferForm(response.data);
        },
        error: () => this.notificationService.error('Unable to load offer.')
      });
  }

  private syncOfferForm(offer: Offer | null): void {
    const onboarding = this.onboarding();

    this.salary = offer?.salary ?? onboarding?.salary ?? 0;
    this.departmentName = offer?.departmentName ?? onboarding?.departmentName ?? '';
    this.designationName = offer?.designationName ?? onboarding?.designationName ?? '';
    this.employmentType = offer?.employmentType ?? onboarding?.employmentType ?? '';
    this.joiningDate = offer?.joiningDate ? this.toDateValue(offer.joiningDate) : onboarding?.joiningDate ? this.toDateValue(onboarding.joiningDate) : '';
    this.expiresAt = offer?.expiresAt ? this.toDateTimeLocal(offer.expiresAt) : '';
  }

  private syncOfferFormFromOnboarding(onboarding: Onboarding): void {
    this.salary = onboarding.salary ?? 0;
    this.departmentName = onboarding.departmentName ?? '';
    this.designationName = onboarding.designationName ?? '';
    this.employmentType = onboarding.employmentType ?? '';
    this.joiningDate = onboarding.joiningDate ? this.toDateValue(onboarding.joiningDate) : '';
    this.expiresAt = '';
  }

  private buildOfferRequest(expiryIsoString: string | null): UpdateOfferRequest {
    const departmentId = this.offer()?.departmentId ?? this.onboarding()?.departmentId ?? null;
    const designationId = this.offer()?.designationId ?? this.onboarding()?.designationId ?? null;

    return {
      salary: Number(this.salary) || 0,
      departmentId,
      departmentName: this.departmentName.trim(),
      designationId,
      designationName: this.designationName.trim(),
      employmentType: this.employmentType.trim() || this.onboarding()?.employmentType || null,
      joiningDate: this.joiningDate || this.onboarding()?.joiningDate || null,
      expiresAt: expiryIsoString
    };
  }

  private toDateValue(value: string | null): string {
    if (!value) {
      return '';
    }

    return new Date(value).toISOString().slice(0, 10);
  }

  private toDateTimeLocal(value: string): string {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
}
