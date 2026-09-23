import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CreateDeductionDto } from '../../../../models/payroll.models';

@Component({
  selector: 'app-deduction-form',
  imports: [FormsModule],
  templateUrl: './deduction-form.html',
  styleUrl: './deduction-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeductionForm {
  readonly isSubmitting = input(false);

  readonly submit = output<CreateDeductionDto>();
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

    const dto: CreateDeductionDto = {
      name: this.name.trim(),
      code: this.code.trim(),
      description: this.description.trim() || null
    };

    this.submit.emit(dto);
  }
}