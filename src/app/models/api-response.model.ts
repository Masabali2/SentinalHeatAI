export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  errors: ValidationError[] | null;
}

export interface ValidationError {
  field: string;
  message: string;
}
