import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './features/dashboard/components/dashboard.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { HiringDashboardComponent } from './features/hiring/pages/hiring-dashboard/hiring-dashboard.component';
import { SingleHiringComponent } from './features/hiring/pages/single-hiring/single-hiring.component';
import { OffersComponent } from './features/hiring/pages/offers/offers.component';
import { OfferLetterComponent } from './features/hiring/pages/offers/offer-letter/offer-letter.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      { path: 'hiring', component: HiringDashboardComponent },

      {
        path: 'hiring/single',
        component: SingleHiringComponent
      },
      {
  path: 'hiring/offers/:onboardingId',
  component: OffersComponent
},
{
  path: 'hiring/offers/:onboardingId/create',
  component: OfferLetterComponent
},
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }
     
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];
