import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthStateService } from '../auth/auth-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authStateService = inject(AuthStateService);

  const isPublicRequest =
    req.url.includes('/onboarding/invitation') ||
    req.url.includes('/offer/invitation') ||
    req.url.includes('/email-verification');

  if (isPublicRequest) {
    return next(req);
  }

  const token = authStateService.user()?.token;

  if (!token) {
    return next(req);
  }

  const authRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authRequest);
};
