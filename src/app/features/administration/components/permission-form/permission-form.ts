import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  CreatePermissionRequest,
  Permission,
  UpdatePermissionRequest
} from '../../../../models/permission.model';

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './permission-form.html',
  styleUrl: './permission-form.css'
})
export class PermissionForm {
  private readonly formBuilder = inject(FormBuilder);

  @Input() permission: Permission | null = null;
  @Input() isSubmitting = false;
  @Input() errorMessage = '';

  @Output()
  submitted = new EventEmitter<
    CreatePermissionRequest | UpdatePermissionRequest
  >();

  @Output()
  cancelled = new EventEmitter<void>();

  readonly form = this.formBuilder.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],
    description: [
      '',
      Validators.maxLength(500)
    ]
  });

  ngOnChanges(): void {
    if (this.permission) {
      this.form.patchValue({
        name: this.permission.name,
        description: this.permission.description
      });

      return;
    }

    this.form.reset({
      name: '',
      description: ''
    });
  }

  get isEditMode(): boolean {
    return this.permission !== null;
  }

  onSubmit(): void {
    if (
      this.form.invalid ||
      this.isSubmitting
    ) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({
      name: this.form.controls.name.value.trim(),
      description:
        this.form.controls.description.value.trim() ||
        undefined
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}