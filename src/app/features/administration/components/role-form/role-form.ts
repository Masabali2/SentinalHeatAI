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
  CreateRoleRequest,
  Role,
  UpdateRoleRequest
} from '../../../../models/role.model';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css'
})
export class RoleForm {
  private readonly formBuilder = inject(FormBuilder);

  @Input() role: Role | null = null;
  @Input() isSubmitting = false;
  @Input() errorMessage = '';

  @Output() submitted = new EventEmitter<
    CreateRoleRequest | UpdateRoleRequest
  >();

  @Output() cancelled = new EventEmitter<void>();

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
    if (this.role) {
      this.form.patchValue({
        name: this.role.name,
        description: this.role.description
      });
    } else {
      this.form.reset({
        name: '',
        description: ''
      });
    }
  }

  get isEditMode(): boolean {
    return this.role !== null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({
      name: this.form.controls.name.value.trim(),
      description: this.form.controls.description.value.trim() || undefined
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}