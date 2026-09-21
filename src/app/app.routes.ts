import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { DashboardComponent } from './features/dashboard/components/dashboard.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { HiringDashboardComponent } from './features/hiring/pages/hiring-dashboard/hiring-dashboard.component';
import { SingleHiringComponent } from './features/hiring/pages/single-hiring/single-hiring.component';
import { OffersComponent } from './features/hiring/pages/offers/offers.component';
import { OfferLetterComponent } from './features/hiring/pages/offers/offer-letter/offer-letter.component';
import { ViewOfferComponent } from './features/hiring/pages/offers/view-offer/view-offer.component';
import { InvitationOfferComponent } from './features/hiring/pages/offers/invitation-offer/invitation-offer.component';
import { EmployeeComponent } from './features/employees/employee.component';
import { EmployeeListComponent } from './features/employees/pages/employee-list/employee-list.component';
import { EmployeeDetailsComponent } from './features/employees/pages/employee-details/employee-details.component';
import { EmployeeEditComponent } from './features/employees/pages/employee-edit/employee-edit.component';
import {DepartmentListComponent} from './features/departments/pages/department-list/department-list.component';
import { DepartmentFormComponent } from './features/departments/pages/department-form/department-form.component';
import { DesignationListComponent } from './features/designations/pages/designation-list/designation-list.component';
import { DesignationFormComponent } from './features/designations/pages/designation-form/designation-form.component';
import { TaskDashboard } from './features/tasks/pages/task-dashboard/task-dashboard';
import { TaskDetails } from './features/tasks/pages/task-details/task-details';
import { TaskForm } from './features/tasks/pages/task-form/task-form';

import { permissionGuard } from './core/guards/permission.guard';
import { PERMISSIONS } from './core/authorization/permission.constants';
export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'accept-invitation',
    component: InvitationOfferComponent
  },
  {
    path: 'register',
    component: InvitationOfferComponent
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
        path: 'employees',
        component: EmployeeComponent,
        children: [
          { path: '', component: EmployeeListComponent },
          { path: 'create', component: EmployeeEditComponent },
          { path: ':id/edit', component: EmployeeEditComponent },
          { path: ':id', component: EmployeeDetailsComponent }
        ]
      },

      {
        path: 'hiring/single',
        component: SingleHiringComponent
      },
      {
  path: 'tasks',
  component: TaskDashboard,
  canActivate: [
    permissionGuard(PERMISSIONS.Task.View)
  ]
},
{
  path: 'tasks/create',
  component: TaskForm,
  canActivate: [
    permissionGuard(PERMISSIONS.Task.Create)
  ]
},
{
  path: 'tasks/:taskId/edit',
  component: TaskForm,
  canActivate: [
    permissionGuard(PERMISSIONS.Task.Update)
  ]
},
{
  path: 'tasks/:taskId',
  component: TaskDetails,
  canActivate: [
    permissionGuard(PERMISSIONS.Task.View)
  ]
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
  path: 'hiring/offers/:onboardingId/edit/:offerId',
  component: OfferLetterComponent
},
{
  path: 'departments',
  component: DepartmentListComponent
},
{
  path: 'departments/create',
  component: DepartmentFormComponent
},
{
  path: 'departments/:id/edit',
  component: DepartmentFormComponent
},
   {
      path: 'designations',
      component: DesignationListComponent
    },
    {
      path: 'designations/create',
      component: DesignationFormComponent
    },
    {
      path: 'designations/:id/edit',
      component: DesignationFormComponent
    },
{
  path: 'hiring/offers/:onboardingId/view/:offerId',
  component: ViewOfferComponent
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
