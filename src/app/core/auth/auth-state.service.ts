import { Injectable, computed, inject, signal } from '@angular/core';

import { AuthResponse } from './auth.models';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  private readonly storageService = inject(StorageService);

  private readonly storageKey = 'auth_response';

  private readonly authResponse = signal<AuthResponse | null>(
    this.loadAuthState()
  );

  readonly user = computed(() => this.authResponse());

  readonly isAuthenticated = computed(
    () => this.authResponse() !== null
  );

  readonly roles = computed(
    () => this.authResponse()?.roles ?? []
  );

  readonly permissions = computed(
    () => this.authResponse()?.permissions ?? []
  );

  setAuthState(response: AuthResponse): void {
    this.authResponse.set(response);

    this.storageService.set(
      this.storageKey,
      response
    );
  }

  clearAuthState(): void {
    this.authResponse.set(null);

    this.storageService.remove(
      this.storageKey
    );
  }

  hasRole(role: string): boolean {
    return this.roles().includes(role);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  private loadAuthState(): AuthResponse | null {
    return this.storageService.get<AuthResponse>(
      this.storageKey
    );
  }
}