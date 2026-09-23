import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CreateAllowanceDto } from '../../../../models/payroll.models';

@Component({
  selector: 'app-allowance-form',
  imports: [FormsModule],
  templateUrl: './allowance-form.html',
  styleUrl: './allowance-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllowanceForm {
  readonly isSubmitting = input(false);

  readonly submit = output<CreateAllowanceDto>();
  readonly cancel = output<void>();

  name = '';
  code = '';
  description = '';

  isValid(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.code.trim().length > 0
    );
  }

  submitForm(): void {
    if (!this.isValid() || this.isSubmitting()) {
      return;
    }

    const dto: CreateAllowanceDto = {
      name: this.name.trim(),
      code: this.code.trim(),
      description: this.description.trim() || null
    };

    this.submit.emit(dto);
  }
}