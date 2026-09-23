import { Component } from '@angular/core';

import { RouterLink } from '@angular/router';

import { AdministrationHeader } from '../../components/administration-header/administration-header';
import { PermissionMatrix } from '../../components/permission-matrix/permission-matrix';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [
    RouterLink,
    AdministrationHeader,
    PermissionMatrix
  ],
  templateUrl: './access-control.html',
  styleUrl: './access-control.css'
})
export class AccessControl {}