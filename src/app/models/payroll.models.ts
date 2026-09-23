export enum PayrollStatus {
  Draft = 1,
  Processing = 2,
  Processed = 3,
  Paid = 4,
  Cancelled = 5
}

export interface AllowanceDto {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

export interface CreateAllowanceDto {
  name: string;
  code: string;
  description?: string | null;
}

export interface DeductionDto {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

export interface CreateDeductionDto {
  name: string;
  code: string;
  description?: string | null;
}

export interface PayrollItemDto {
  id: number;
  name: string;
  code: string;
  amount: number;
}

export interface PayrollListDto {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  status: PayrollStatus;
  processedAt: string | null;
  paidAt: string | null;
}

export interface AddPayrollAllowanceDto {
  allowanceId: number;
  amount: number;
}

export interface AddPayrollDeductionDto {
  deductionId: number;
  amount: number;
}

export interface GeneratePayrollDto {
  employeeId: number;
  year: number;
  month: number;
  allowances: AddPayrollAllowanceDto[];
  deductions: AddPayrollDeductionDto[];
}

export interface PayrollDto {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  basicSalary: number;
  totalAllowance: number;
  totalDeduction: number;
  grossSalary: number;
  netSalary: number;
  status: PayrollStatus;
  processedAt: string | null;
  paidAt: string | null;
  paidByUserId: string | null;
  allowances: PayrollItemDto[];
  deductions: PayrollItemDto[];
}