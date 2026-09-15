import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { HttpErrorHandlerService } from '../guards/http/http-error-handler.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const errorHandlerService = inject(
    HttpErrorHandlerService
  );

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      const isAuthenticationRequest =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register');

      if (!isAuthenticationRequest) {
        errorHandlerService.handle(error);
      }

      return throwError(() => error);
    })
  );
};
