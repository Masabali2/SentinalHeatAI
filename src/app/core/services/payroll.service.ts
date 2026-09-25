import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AllowanceDto,
  CreateAllowanceDto,
  DeductionDto,
  CreateDeductionDto,
  GeneratePayrollDto,
  PayrollDto,
  PayrollListDto,
  AddPayrollAllowanceDto,
  AddPayrollDeductionDto
} from '../../models/payroll.models';

import { ApiResponse } from '../../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayrollService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/payroll`;

  // Allowances

  createAllowance(
    dto: CreateAllowanceDto
  ): Observable<ApiResponse<AllowanceDto>> {
    return this.http.post<ApiResponse<AllowanceDto>>(
      `${this.apiUrl}/allowances`,
      dto
    );
  }

  getAllowances(): Observable<ApiResponse<AllowanceDto[]>> {
    return this.http.get<ApiResponse<AllowanceDto[]>>(
      `${this.apiUrl}/allowances`
    );
  }

  // Deductions

  createDeduction(
    dto: CreateDeductionDto
  ): Observable<ApiResponse<DeductionDto>> {
    return this.http.post<ApiResponse<DeductionDto>>(
      `${this.apiUrl}/deductions`,
      dto
    );
  }

  getDeductions(): Observable<ApiResponse<DeductionDto[]>> {
    return this.http.get<ApiResponse<DeductionDto[]>>(
      `${this.apiUrl}/deductions`
    );
  }

  // Payroll

  generatePayroll(
    dto: GeneratePayrollDto
  ): Observable<ApiResponse<PayrollDto>> {
    return this.http.post<ApiResponse<PayrollDto>>(
      `${this.apiUrl}/generate`,
      dto
    );
  }

  getAll(): Observable<ApiResponse<PayrollListDto[]>> {
    return this.http.get<ApiResponse<PayrollListDto[]>>(
      this.apiUrl
    );
  }

  getById(
    payrollId: number
  ): Observable<ApiResponse<PayrollDto>> {
    return this.http.get<ApiResponse<PayrollDto>>(
      `${this.apiUrl}/${payrollId}`
    );
  }

  // Payroll allowances

  addAllowance(
    payrollId: number,
    dto: AddPayrollAllowanceDto
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/${payrollId}/allowances`,
      dto
    );
  }

  removeAllowance(
    payrollId: number,
    allowanceId: number
  ): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.apiUrl}/${payrollId}/allowances/${allowanceId}`
    );
  }

  // Payroll deductions

  addDeduction(
    payrollId: number,
    dto: AddPayrollDeductionDto
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/${payrollId}/deductions`,
      dto
    );
  }

  removeDeduction(
    payrollId: number,
    deductionId: number
  ): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.apiUrl}/${payrollId}/deductions/${deductionId}`
    );
  }

  // Payroll processing

  processPayroll(
    payrollId: number
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/${payrollId}/process`,
      null
    );
  }

  markAsPaid(
    payrollId: number
  ): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.apiUrl}/${payrollId}/pay`,
      null
    );
  }
  cancelPayroll(
  payrollId: number
): Observable<ApiResponse<unknown>> {
  return this.http.post<ApiResponse<unknown>>(
    `${this.apiUrl}/${payrollId}/cancel`,
    null
  );
}
bulkMarkAsPaid(payrollIds: number[]) {
  return this.http.post<ApiResponse<string>>(
    `${this.apiUrl}/bulk/pay`,
    { payrollIds }
  );
}
deleteAllowance(id: number): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(
    `${this.apiUrl}/allowances/${id}`
  );
}

deleteDeduction(id: number): Observable<ApiResponse<null>> {
  return this.http.delete<ApiResponse<null>>(
    `${this.apiUrl}/deductions/${id}`
  );
} 
activateAllowance(id: number): Observable<ApiResponse<null>> {
  return this.http.patch<ApiResponse<null>>(
    `${this.apiUrl}/allowances/${id}/activate`,
    {}
  );
}

activateDeduction(id: number): Observable<ApiResponse<null>> {
  return this.http.patch<ApiResponse<null>>(
    `${this.apiUrl}/deductions/${id}/activate`,
    {}
  );
}
}