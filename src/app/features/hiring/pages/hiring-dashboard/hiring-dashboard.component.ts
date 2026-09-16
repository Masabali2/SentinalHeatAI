import { Component, OnInit, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { filter, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HiringOptionCardComponent } from '../../components/hiring-option-card/hiring-option-card.component';
import { OnboardingService } from '../../../../core/services/onboarding.service';
import { NotificationService } from '../../../../core/services/notification.service';

import {
  OnboardingInProgress,
  OnboardingStatus
} from '../../models/onboarding.model';

@Component({
  selector: 'app-hiring-dashboard',
  standalone: true,
  imports: [
    HiringOptionCardComponent,
    DatePipe
  ],
  templateUrl: './hiring-dashboard.component.html',
  styleUrl: './hiring-dashboard.component.css'
})
export class HiringDashboardComponent implements OnInit {

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly onboardingService = inject(OnboardingService);
  private readonly notificationService = inject(NotificationService);

  readonly hiringInProgress = signal<OnboardingInProgress[]>([]);
  readonly isLoadingHiringProgress = signal(false);

  readonly OnboardingStatus = OnboardingStatus;

  readonly onboardingStages = [
    {
      key: 'offer-pending',
      label: 'Offer Pending'
    },
    {
      key: 'offer-accepted',
      label: 'Offer Accepted'
    },
    {
      key: 'profile-submitted',
      label: 'Profile Submitted'
    },
    {
      key: 'verification',
      label: 'Email Verification'
    }
  ];

  ngOnInit(): void {
    this.loadHiringInProgress();

    this.router.events
      .pipe(
        filter(
          event =>
            event instanceof NavigationEnd &&
            event.urlAfterRedirects === '/hiring'
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadHiringInProgress());
  }

  startSingleHiring(): void {
    this.router.navigate(['/hiring/single']);
  }

  startBulkHiring(): void {
    this.router.navigate(['/hiring/bulk-hiring']);
  }

  viewHiringInProgress(): void {
    // Detailed hiring-progress page can be added later.
  }

  viewHiringProcess(onboardingId: number): void {
    this.router.navigate([
      '/hiring/offers',
      onboardingId
    ]);
  }

  getStatusLabel(status: OnboardingStatus): string {
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

      default:
        return 'In Progress';
    }
  }

  getStatusClass(status: OnboardingStatus): string {
    switch (status) {
      case OnboardingStatus.OfferPending:
        return 'status-offer';

      case OnboardingStatus.OfferAccepted:
        return 'status-accepted';

      case OnboardingStatus.ProfileSubmitted:
        return 'status-profile';

      case OnboardingStatus.ValidationFailed:
        return 'status-warning';

      case OnboardingStatus.EmailVerificationPending:
        return 'status-verification';

      case OnboardingStatus.EmailVerified:
        return 'status-verified';

      default:
        return 'status-default';
    }
  }

  getStageCount(stage: string): number {
    return this.hiringInProgress().filter(candidate => {
      switch (stage) {
        case 'offer-pending':
          return candidate.status === OnboardingStatus.OfferPending;
        case 'offer-accepted':
          return candidate.status === OnboardingStatus.OfferAccepted;
        case 'profile-submitted':
          return candidate.status === OnboardingStatus.ProfileSubmitted;
        case 'verification':
          return candidate.status === OnboardingStatus.EmailVerificationPending;
        default:
          return false;
      }
    }).length;
  }

  private loadHiringInProgress(): void {
    this.isLoadingHiringProgress.set(true);

    this.onboardingService
      .getInProgress()
      .pipe(
        finalize(() => this.isLoadingHiringProgress.set(false))
      )
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            return;
          }

          this.hiringInProgress.set(response.data);
        }
      });
  }

}