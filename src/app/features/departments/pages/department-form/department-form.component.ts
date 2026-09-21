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

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { finalize } from 'rxjs';

import {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest
} from '../../../../models/department.model';

import { DepartmentService } from '../../../../core/services/department.service';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.css'
})
export class DepartmentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  private readonly route = inject(
    ActivatedRoute
  );

  private readonly router = inject(
    Router
  );

  private readonly departmentService =
    inject(DepartmentService);

  private readonly notificationService =
    inject(NotificationService);


  readonly isEditMode = signal(false);

  readonly isLoading = signal(false);

  readonly isSubmitting = signal(false);


  private departmentId: number | null = null;


  readonly departmentForm =
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
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    const departmentId = Number(id);

    if (Number.isNaN(departmentId)) {
      this.notificationService.error(
        'Invalid department ID.'
      );

      return;
    }

    this.isEditMode.set(true);

    this.departmentId = departmentId;

    this.loadDepartment(departmentId);
  }


  get name() {
    return this.departmentForm.controls.name;
  }


  get code() {
    return this.departmentForm.controls.code;
  }


  get description() {
    return this.departmentForm.controls.description;
  }


  submit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();

      return;
    }


    if (
      this.isEditMode() &&
      this.departmentId === null
    ) {
      this.notificationService.error(
        'Invalid department.'
      );

      return;
    }


    this.isSubmitting.set(true);

    const formValue =
      this.departmentForm.getRawValue();


    if (this.isEditMode()) {
      const request: UpdateDepartmentRequest = {
        name: formValue.name.trim(),
        code: formValue.code.trim(),
        description:
          formValue.description.trim() ||
          null
      };

      this.updateDepartment(
        this.departmentId!,
        request
      );

      return;
    }


    const request: CreateDepartmentRequest = {
      name: formValue.name.trim(),
      code: formValue.code.trim(),
      description:
        formValue.description.trim() ||
        null
    };

    this.createDepartment(request);
  }


  cancel(): void {
    void this.router.navigate([
      '/departments'
    ]);
  }


  private loadDepartment(
    id: number
  ): void {
    this.isLoading.set(true);

    this.departmentService
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
              'Unable to load department.'
            );

            return;
          }

          this.populateForm(
            response.data
          );
        },

        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }
      });
  }


  private populateForm(
    department: Department
  ): void {
    this.departmentForm.patchValue({
      name: department.name,
      code: department.code,
      description:
        department.description ?? ''
    });
  }


  private createDepartment(
    request: CreateDepartmentRequest
  ): void {
    this.departmentService
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
              'Unable to create department.'
            );

            return;
          }

          this.notificationService.success(
            'Department created successfully.'
          );

          void this.router.navigate([
            '/departments'
          ]);
        },

        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }
      });
  }


  private updateDepartment(
    id: number,
    request: UpdateDepartmentRequest
  ): void {
    this.departmentService
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
              'Unable to update department.'
            );

            return;
          }

          this.notificationService.success(
            'Department updated successfully.'
          );

          void this.router.navigate([
            '/departments'
          ]);
        },

        error: () => {
          // HTTP errors are handled
          // by the global error interceptor.
        }
      });
  }
}