import { Component,OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {Router}  from '@angular/router';
import { finalize, interval, Subscription } from 'rxjs';

import {
  Dashboard,
  DashboardStat,
  DashboardChartData
} from '../../../models/dashboard.model';

import { DashboardService } from '../../../core/services/dashboard.service';
import { AuthStateService } from '../../../core/auth/auth-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly authStateService = inject(AuthStateService);
  private readonly router = inject(Router);
  private greetingTimer?: Subscription;
  readonly dashboard = signal<Dashboard | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly greeting = signal('Good morning');

  readonly chartColors = [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#7c3aed',
    '#db2777',
    '#0891b2'
  ];
private updateGreeting(): void {
  const hour = new Date().getHours();

  if (hour < 12) {
    this.greeting.set('Good morning');
  } else if (hour < 18) {
    this.greeting.set('Good afternoon');
  } else {
    this.greeting.set('Good evening');
  }
}
openPriorityWork(route: string): void {
  const urlTree = this.router.parseUrl(route);

  urlTree.queryParams = {
    ...urlTree.queryParams,
    returnUrl: '/dashboard'
  };

  void this.router.navigateByUrl(urlTree);
}
  ngOnInit(): void {
    this.loadDashboard();

  this.greetingTimer = interval(60_000).subscribe(() => {
    this.updateGreeting();
  });

    this.updateGreeting();
  }

  get firstName(): string {
    return this.authStateService.user()?.firstName ?? 'User';
  }

  reloadDashboard(): void {
    this.loadDashboard();
  }

  primaryStats(stats: DashboardStat[]): DashboardStat[] {
    const priorityKeys = [
      'totalEmployees',
      'totalDepartments',
      'pendingOffers',
      'pendingOnboarding'
    ];

    return priorityKeys
      .map(key => stats.find(stat => stat.key === key))
      .filter(
        (stat): stat is DashboardStat =>
          stat !== undefined
      );
  }

  colorFor(index: number): string {
    return this.chartColors[
      index % this.chartColors.length
    ];
  }

  donutTotal(data: DashboardChartData[]): number {
    return data.reduce(
      (total, item) => total + item.value,
      0
    );
  }

  donutBackground(data: DashboardChartData[]): string {
    const total = this.donutTotal(data);

    if (total === 0) {
      return '#e2e8f0';
    }

    let position = 0;

    const stops = data.map((item, index) => {
      const start = position;

      position += (item.value / total) * 100;

      return `${this.colorFor(index)} ${start}% ${position}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.dashboardService
      .getDashboard()
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: response => {
          if (!response.success || !response.data) {
            this.errorMessage.set(
              response.message ||
              'Unable to load dashboard data.'
            );

            return;
          }

          this.dashboard.set(response.data);
        },

        error: error => {
          const errorBody = error?.error;

          const backendMessage =
            typeof errorBody === 'string'
              ? errorBody
              : errorBody?.message;

          this.errorMessage.set(
            backendMessage ||
            'Unable to load dashboard data.'
          );
        }
      });
  }
  ngOnDestroy(): void {
  this.greetingTimer?.unsubscribe();
}
}