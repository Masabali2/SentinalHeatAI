import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { OnboardingService } from '../../../../../core/services/onboarding.service';
import { EmailVerificationService } from '../../../../../core/services/email-verification.service';
import { OfferService } from '../../../../../core/services/offer.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import {
  CandidateOnboarding,
  OnboardingStatus,
  SubmitOnboardingRequest
} from '../../../models/onboarding.model';

@Component({
  selector: 'app-invitation-offer',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule],
  templateUrl: './invitation-offer.component.html',
  styleUrl: './invitation-offer.component.css'
})
export class InvitationOfferComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly onboardingService = inject(OnboardingService);
  private readonly emailVerificationService = inject(EmailVerificationService);
  private readonly offerService = inject(OfferService);
  private readonly notificationService = inject(NotificationService);

  readonly candidate = signal<CandidateOnboarding | null>(null);
  readonly isLoading = signal(true);
  readonly isResponding = signal(false);
  readonly isRegistering = signal(false);
  readonly showRegistration = signal(false);
  readonly registrationComplete = signal(false);
  readonly showVerification = signal(false);
  readonly emailVerified = signal(false);
  readonly isVerifying = signal(false);
  readonly isResending = signal(false);
  readonly response = signal<'accepted' | 'declined' | null>(null);
  readonly errorMessage = signal('');
  readonly verificationMessage = signal('');

  otp = '';

  registration: SubmitOnboardingRequest = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    profilePicture: null,
    password: ''
  };

  private token = '';

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.isLoading.set(false);
      this.errorMessage.set('This offer link is missing its invitation token.');
      return;
    }

    this.onboardingService.getByInvitationToken(this.token)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: result => {
          if (result.success && result.data) {
            const normalizedCandidate = this.normalizeCandidate(result.data);
            this.candidate.set(normalizedCandidate);
            this.openRegistrationForAcceptedCandidate(normalizedCandidate);
            this.registration.firstName = result.data.firstName || '';
            this.registration.lastName = result.data.lastName || '';
            this.registration.phone = result.data.phone || '';
            return;
          }

          this.errorMessage.set(result.message || 'This offer link is no longer valid.');
        },
        error: error => {
          this.errorMessage.set(
            error?.error?.message || 'This offer link is no longer valid.'
          );
        }
      });
  }

  respond(accept: boolean): void {
    if (!this.token || !this.candidate() || this.isResponding()) {
      return;
    }

    this.isResponding.set(true);
    this.offerService.respondByInvitation(this.token, { accept })
      .pipe(finalize(() => this.isResponding.set(false)))
      .subscribe({
        next: result => {
          if (result.success) {
            this.response.set(accept ? 'accepted' : 'declined');
            return;
          }

          this.notificationService.error(result.message || 'Unable to submit your response.');
        },
        error: error => this.notificationService.error(
          error?.error?.message || 'Unable to submit your response.'
        )
      });
  }

  openRegistration(): void {
    this.showRegistration.set(true);
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.registration.profilePicture = input.files?.[0] || null;
  }

  register(): void {
    if (this.isRegistering()) {
      return;
    }

    this.isRegistering.set(true);
    this.onboardingService.submitByInvitation(this.token, this.registration)
      .pipe(finalize(() => this.isRegistering.set(false)))
      .subscribe({
        next: result => {
          if (result.success) {
            this.registrationComplete.set(true);
            this.showRegistration.set(false);
            this.showVerification.set(true);
            return;
          }

          this.notificationService.error(
            result.message || 'Unable to complete registration.'
          );
        },
        error: error => this.notificationService.error(
          error?.error?.message || 'Unable to complete registration.'
        )
      });
  }

  verifyEmail(): void {
    if (this.otp.length !== 6 || this.isVerifying()) {
      this.verificationMessage.set('Enter the 6-digit code sent to your email.');
      return;
    }

    this.verificationMessage.set('');
    this.isVerifying.set(true);
    this.emailVerificationService.verify(this.token, this.otp)
      .pipe(finalize(() => this.isVerifying.set(false)))
      .subscribe({
        next: result => {
          if (result.success) {
            this.showVerification.set(false);
            this.emailVerified.set(true);
            return;
          }

          this.verificationMessage.set(
            result.message || 'The verification code is invalid.'
          );
        },
        error: error => this.verificationMessage.set(
          error?.error?.message || 'The verification code is invalid or expired.'
        )
      });
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }

  private openRegistrationForAcceptedCandidate(
    candidate: CandidateOnboarding
  ): void {
    if (
      candidate.status === OnboardingStatus.OfferAccepted ||
      candidate.status === OnboardingStatus.ProfileIncomplete
    ) {
      this.showRegistration.set(true);
    }
  }

  resendVerificationCode(): void {
    if (this.isResending()) {
      return;
    }

    this.isResending.set(true);
    this.emailVerificationService.resend(this.token)
      .pipe(finalize(() => this.isResending.set(false)))
      .subscribe({
        next: result => this.verificationMessage.set(
          result.message || 'A new verification code has been sent.'
        ),
        error: error => this.verificationMessage.set(
          error?.error?.message || 'Unable to resend the verification code.'
        )
      });
  }

  private normalizeCandidate(candidate: CandidateOnboarding): CandidateOnboarding {
    const raw = candidate as CandidateOnboarding & Record<string, unknown>;
    const department = raw['department'] as { name?: string | null } | string | null | undefined;
    const designation = raw['designation'] as { name?: string | null } | string | null | undefined;
    const manager = raw['manager'] as { name?: string | null } | string | null | undefined;
    const offer = raw['offer'] as Record<string, unknown> | null | undefined;

    const lookupName = (
      value: { name?: string | null } | string | null | undefined
    ): string | null => typeof value === 'string' ? value : value?.name || null;

    const value = (key: string, fallbackKey: string): unknown =>
      raw[key] ?? raw[fallbackKey] ?? offer?.[key] ?? offer?.[fallbackKey];

    return {
      ...candidate,
      departmentName:
        candidate.departmentName ||
        String(value('departmentName', 'DepartmentName') || lookupName(department) || '') ||
        null,
      designationName:
        candidate.designationName ||
        String(value('designationName', 'DesignationName') || lookupName(designation) || '') ||
        null,
      managerName:
        candidate.managerName ||
        String(value('managerName', 'ManagerName') || lookupName(manager) || '') ||
        null,
      offerExpiresAt:
        candidate.offerExpiresAt ||
        String(value('offerExpiresAt', 'OfferExpiresAt') || value('expiresAt', 'ExpiresAt') || '') ||
        null,
      invitationExpiresAt:
        candidate.invitationExpiresAt ||
        String(value('invitationExpiresAt', 'InvitationExpiresAt') || '') ||
        null
    };
  }

}