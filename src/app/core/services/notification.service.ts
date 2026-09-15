
import { Injectable, signal } from '@angular/core';

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface Notification {
  type: NotificationType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly notificationState =
    signal<Notification | null>(null);

  readonly notification = this.notificationState.asReadonly();

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  clear(): void {
    this.notificationState.set(null);
  }

  private show(
    type: NotificationType,
    message: string
  ): void {
    this.notificationState.set({
      type,
      message
    });
  }
}