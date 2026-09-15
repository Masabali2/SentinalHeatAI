import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

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

  readonly dashboard = signal<Dashboard | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly chartColors = [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#7c3aed',
    '#db2777',
    '#0891b2'
  ];

  ngOnInit(): void {
    this.loadDashboard();
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
      'totalOffers',
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
}