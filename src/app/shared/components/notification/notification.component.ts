import { Component, inject } from '@angular/core';

import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent {

  private readonly notificationService =
    inject(NotificationService);

  readonly notification =
    this.notificationService.notification;

  close(): void {
    this.notificationService.clear();
  }
}