import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { Router } from '@angular/router';

import { finalize } from 'rxjs';

import { Designation } from '../../../../models/designation.model';

import { DesignationService } from '../../../../core/services/designation.service';

import { NotificationService } from '../../../../core/services/notification.service';


@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [],
  templateUrl: './designation-list.component.html',
  styleUrl: './designation-list.component.css'
})
export class DesignationListComponent
  implements OnInit {

  private readonly designationService =
    inject(DesignationService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly router =
    inject(Router);


  readonly designations =
    signal<Designation[]>([]);

  readonly isLoading =
    signal(false);


  readonly openMenuId =
    signal<number | null>(null);


  readonly showFilters =
    signal(false);

  readonly searchTerm =
    signal('');

  readonly statusFilter =
    signal<
      'all' |
      'active' |
      'inactive'
    >('all');


  readonly filteredDesignations =
    computed(() => {

      const designations =
        this.designations();

      const search =
        this.searchTerm()
          .trim()
          .toLowerCase();

      const status =
        this.statusFilter();


      return designations.filter(
        designation => {

          const matchesSearch =
            !search ||
            designation.name
              .toLowerCase()
              .includes(search) ||
            designation.code
              .toLowerCase()
              .includes(search);


          const matchesStatus =
            status === 'all' ||
            (
              status === 'active' &&
              designation.isActive
            ) ||
            (
              status === 'inactive' &&
              !designation.isActive
            );


          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    });


  ngOnInit(): void {
    this.loadDesignations();
  }


  reloadDesignations(): void {
    this.loadDesignations();
  }


  addDesignation(): void {
    void this.router.navigate([
      '/designations/create'
    ]);
  }


  toggleFilters(): void {
    this.showFilters.update(
      value => !value
    );
  }


  setSearchTerm(
    value: string
  ): void {
    this.searchTerm.set(value);
  }


  setStatusFilter(
    status:
      'all' |
      'active' |
      'inactive'
  ): void {
    this.statusFilter.set(status);
  }


  clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
  }


  toggleActionMenu(
    designationId: number
  ): void {
    this.openMenuId.update(
      currentId =>
        currentId === designationId
          ? null
          : designationId
    );
  }


  closeActionMenu(): void {
    this.openMenuId.set(null);
  }


  editDesignation(
    designation: Designation
  ): void {

    this.closeActionMenu();

    void this.router.navigate([
      '/designations',
      designation.id,
      'edit'
    ]);
  }


  toggleDesignationStatus(
    designation: Designation
  ): void {

    this.closeActionMenu();

    if (designation.isActive) {

      this.deactivateDesignation(
        designation.id
      );

      return;
    }

    this.activateDesignation(
      designation.id
    );
  }


  deleteDesignation(
    designation: Designation
  ): void {

    this.closeActionMenu();


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${designation.name}"?`
      );


    if (!confirmed) {
      return;
    }


    this.designationService
      .delete(designation.id)
      .subscribe({

        next: response => {

          if (!response.success) {

            this.notificationService.error(
              response.message ||
              'Unable to delete designation.'
            );

            return;
          }


          this.notificationService.success(
            'Designation deleted successfully.'
          );


          this.loadDesignations();
        },


        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }

      });
  }


  private activateDesignation(
    designationId: number
  ): void {

    this.designationService
      .activate(designationId)
      .subscribe({

        next: response => {

          if (!response.success) {

            this.notificationService.error(
              response.message ||
              'Unable to activate designation.'
            );

            return;
          }


          this.notificationService.success(
            'Designation activated successfully.'
          );


          this.loadDesignations();
        },


        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }

      });
  }


  private deactivateDesignation(
    designationId: number
  ): void {

    this.designationService
      .deactivate(designationId)
      .subscribe({

        next: response => {

          if (!response.success) {

            this.notificationService.error(
              response.message ||
              'Unable to deactivate designation.'
            );

            return;
          }


          this.notificationService.success(
            'Designation deactivated successfully.'
          );


          this.loadDesignations();
        },


        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }

      });
  }


  private loadDesignations(): void {

    this.isLoading.set(true);

    this.closeActionMenu();


    this.designationService
      .getAll()
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

            this.notificationService.error(
              response.message ||
              'Unable to load designations.'
            );

            return;
          }


          this.designations.set(
            response.data
          );
        },


        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }

      });
  }
}