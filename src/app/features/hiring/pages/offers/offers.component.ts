
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { OfferService } from '../../../../core/services/offer.service';
import { NotificationService } from '../../../../core/services/notification.service';

import {
  Offer,
  OfferStatus
} from '../../models/offer.model';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly offerService =
    inject(OfferService);

  private readonly notificationService =
    inject(NotificationService);

  readonly offers = signal<Offer[]>([]);

  readonly isLoading = signal(false);

  readonly onboardingId =
    signal<number | null>(null);

  readonly OfferStatus = OfferStatus;

  ngOnInit(): void {
    this.loadOnboardingId();
  }

  createOffer(): void {
    const onboardingId = this.onboardingId();

    if (!onboardingId) {
      this.notificationService.error(
        'Invalid onboarding ID.'
      );

      return;
    }

    this.router.navigate([
      '/hiring/offers',
      onboardingId,
      'create'
    ]);
  }

  viewOffer(offerId: number): void {
    const onboardingId = this.onboardingId();

    if (!onboardingId) {
      this.notificationService.error(
        'Invalid onboarding ID.'
      );

      return;
    }

    this.router.navigate([
      '/hiring/offers',
      onboardingId,
      'view',
      offerId
    ]);
  }

  continueOffer(offerId: number): void {
    const onboardingId = this.onboardingId();

    if (!onboardingId) {
      this.notificationService.error(
        'Invalid onboarding ID.'
      );

      return;
    }

    this.router.navigate([
      '/hiring/offers',
      onboardingId,
      'edit',
      offerId
    ]);
  }

  private loadOnboardingId(): void {

    const id = this.route.snapshot.paramMap.get(
      'onboardingId'
    );

    const onboardingId = id
      ? Number(id)
      : null;

    if (!onboardingId || Number.isNaN(onboardingId)) {

      this.notificationService.error(
        'Invalid onboarding ID.'
      );

      return;
    }

    this.onboardingId.set(onboardingId);

    this.loadOffers(onboardingId);
  }

  private loadOffers(
    onboardingId: number
  ): void {

    this.isLoading.set(true);

    this.offerService
      .getByOnboardingId(onboardingId)
      .pipe(
        finalize(() =>
          this.isLoading.set(false)
        )
      )
      .subscribe({

        next: response => {

          if (!response.success || !response.data) {

            this.notificationService.error(
              response.message ||
              'Unable to load offers.'
            );

            return;
          }

          this.offers.set(response.data);
        },

        error: error => {

          const errorBody = error?.error;

          const backendMessage =
            typeof errorBody === 'string'
              ? errorBody
              : errorBody?.message;

          this.notificationService.error(
            backendMessage ||
            'Unable to load offers.'
          );
        }

      });
  }

  getOfferStatusLabel(status: OfferStatus): string {

    switch (status) {

      case OfferStatus.Draft:
        return 'Draft';

      case OfferStatus.Sent:
        return 'Sent';

      case OfferStatus.Viewed:
        return 'Viewed';

      case OfferStatus.Accepted:
        return 'Accepted';

      case OfferStatus.Declined:
        return 'Declined';

      case OfferStatus.Expired:
        return 'Expired';

      case OfferStatus.Cancelled:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }
}
