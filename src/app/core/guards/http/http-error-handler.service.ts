import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from '../../services/notification.service';
import { ApiResponse } from '../../../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  private readonly notificationService =
    inject(NotificationService);

  handle(error: HttpErrorResponse): void {
    const message = this.getErrorMessage(error);

    this.notificationService.error(message);
  }

  private getErrorMessage(error: HttpErrorResponse): string {

    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection or try again later.';
    }

    const apiResponse = this.getApiResponse(error);

    if (apiResponse?.message) {
      return apiResponse.message;
    }

    switch (error.status) {
      case 400:
        return 'The request is invalid. Please check your information and try again.';

      case 401:
        return 'You are not authorized. Please sign in again.';

      case 403:
        return 'You do not have permission to perform this action.';

      case 404:
        return 'The requested resource was not found.';

      case 409:
        return 'The request could not be completed because of a conflict.';

      case 422:
        return 'The submitted information could not be processed.';

      case 500:
        return 'An unexpected server error occurred. Please try again later.';

      case 502:
      case 503:
      case 504:
        return 'The server is temporarily unavailable. Please try again later.';

      default:
        return 'Something went wrong. Please try again later.';
    }
  }

  private getApiResponse(
    error: HttpErrorResponse
  ): ApiResponse<unknown> | null {

    if (
      error.error &&
      typeof error.error === 'object' &&
      'message' in error.error
    ) {
      return error.error as ApiResponse<unknown>;
    }

    return null;
  }
}