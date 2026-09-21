import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  CreateDesignationRequest,
  UpdateDesignationRequest
} from '../../../../models/designation.model';

import { DesignationService } from '../../../../core/services/designation.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-designation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './designation-form.component.html',
  styleUrl: './designation-form.component.css'
})
export class DesignationFormComponent
  implements OnInit {

  private readonly fb =
    inject(FormBuilder);

  private readonly designationService =
    inject(DesignationService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);


  readonly isEditMode =
    signal(false);

  readonly isLoading =
    signal(false);

  readonly isSubmitting =
    signal(false);


  private designationId: number | null = null;


  readonly designationForm =
    this.fb.nonNullable.group({

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      code: [
        '',
        [
          Validators.required,
          Validators.maxLength(20)
        ]
      ],

      description: [
        '',
        [
          Validators.maxLength(500)
        ]
      ]

    });


  ngOnInit(): void {

    const id =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    if (id) {

      this.isEditMode.set(true);
      this.designationId = id;

      this.loadDesignation(id);
    }
  }


  get name() {
    return this.designationForm.controls.name;
  }


  get code() {
    return this.designationForm.controls.code;
  }


  get description() {
    return this.designationForm.controls.description;
  }


  cancel(): void {
    void this.router.navigate([
      '/designations'
    ]);
  }


  submit(): void {

    if (this.designationForm.invalid) {

      this.designationForm.markAllAsTouched();

      return;
    }


    if (
      this.isEditMode() &&
      this.designationId === null
    ) {

      this.notificationService.error(
        'Invalid designation.'
      );

      return;
    }


    this.isSubmitting.set(true);


    const formValue =
      this.designationForm.getRawValue();


    if (this.isEditMode()) {

      const request:
        UpdateDesignationRequest = {

        name: formValue.name.trim(),

        code: formValue.code.trim(),

        description:
          formValue.description.trim() || null

      };


      this.updateDesignation(
        this.designationId!,
        request
      );

      return;
    }


    const request:
      CreateDesignationRequest = {

      name: formValue.name.trim(),

      code: formValue.code.trim(),

      description:
        formValue.description.trim() || null

    };


    this.designationService
      .create(request)
      .pipe(
        finalize(() =>
          this.isSubmitting.set(false)
        )
      )
      .subscribe({

        next: response => {

          if (!response.success) {

            this.notificationService.error(
              response.message ||
              'Unable to create designation.'
            );

            return;
          }


          this.notificationService.success(
            'Designation created successfully.'
          );


          void this.router.navigate([
            '/designations'
          ]);
        },

        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }

      });
  }


  private updateDesignation(
    id: number,
    request: UpdateDesignationRequest
  ): void {

    this.designationService
      .update(id, request)
      .pipe(
        finalize(() =>
          this.isSubmitting.set(false)
        )
      )
      .subscribe({

        next: response => {

          if (!response.success) {

            this.notificationService.error(
              response.message ||
              'Unable to update designation.'
            );

            return;
          }


          this.notificationService.success(
            'Designation updated successfully.'
          );


          void this.router.navigate([
            '/designations'
          ]);
        },

        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }

      });
  }


  private loadDesignation(
    id: number
  ): void {

    this.isLoading.set(true);


    this.designationService
      .getById(id)
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
              'Unable to load designation.'
            );

            void this.router.navigate([
              '/designations'
            ]);

            return;
          }


          const designation =
            response.data;


          this.designationForm.patchValue({

            name: designation.name,

            code: designation.code,

            description:
              designation.description ?? ''

          });
        },

        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }

      });
  }

}