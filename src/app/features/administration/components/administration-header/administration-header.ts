import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-administration-header',
  standalone: true,
  imports: [],
  templateUrl: './administration-header.html',
  styleUrl: './administration-header.css'
})
export class AdministrationHeader {
  @Input() title = 'Administration';
  @Input() description = 'Manage roles, permissions, access control, and system settings.';
}