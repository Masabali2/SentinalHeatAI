import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Role } from '../../../../models/role.model';

@Component({
  selector: 'app-role-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './role-card.html',
  styleUrl: './role-card.css'
})
export class RoleCard {
  @Input({ required: true }) role!: Role;
}