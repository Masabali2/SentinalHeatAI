import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { Permission } from '../../../../models/permission.model';

@Component({
  selector: 'app-permission-group',
  standalone: true,
  imports: [],
  templateUrl: './permission-group.html',
  styleUrl: './permission-group.css'
})
export class PermissionGroup {
  @Input({ required: true }) groupName!: string;

  @Input() permissions: Permission[] = [];

  @Input() selectedPermissionIds: number[] = [];

  @Output() permissionToggled = new EventEmitter<number>();

  @Output() groupToggled = new EventEmitter<boolean>();

  isSelected(permissionId: number): boolean {
    return this.selectedPermissionIds.includes(permissionId);
  }

  get isGroupFullySelected(): boolean {
    return (
      this.permissions.length > 0 &&
      this.permissions.every(permission =>
        this.isSelected(permission.id)
      )
    );
  }

  get isGroupPartiallySelected(): boolean {
    const selectedCount = this.permissions.filter(permission =>
      this.isSelected(permission.id)
    ).length;

    return selectedCount > 0 &&
      selectedCount < this.permissions.length;
  }

  togglePermission(permissionId: number): void {
    this.permissionToggled.emit(permissionId);
  }

  toggleGroup(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    this.groupToggled.emit(checkbox.checked);
  }
}