import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../../core/auth/auth.service';
import { LoginRequest } from '../../../../core/auth/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginRequest: LoginRequest = {
    email: '',
    password: ''
  };

  showPassword = false;
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  rememberMe = false;

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.login(this.loginRequest).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: response => {
        if (!response.success || !response.data) {
          this.errorMessage.set(response.message || 'Unable to sign in.');

          return;
        }

        void this.router.navigate(['/dashboard']).catch(() => {
          this.errorMessage.set(
            'Unable to open the dashboard. Please try again.'
          );
        });
      },

      error: (error: HttpErrorResponse) => {
        const errorBody = error.error;
        const backendMessage =
          typeof errorBody === 'string'
            ? errorBody
            : errorBody?.message || errorBody?.Message;

        this.errorMessage.set(
          backendMessage || 'Unable to sign in. Please check your credentials and try again.'
        );
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
