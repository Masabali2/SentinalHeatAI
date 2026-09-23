import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface PermissionFilterValue {
  searchTerm: string;
  groupName: string;
}

@Component({
  selector: 'app-permission-filter',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './permission-filter.html',
  styleUrl: './permission-filter.css'
})
export class PermissionFilter {
  @Input() groups: string[] = [];

  @Output()
  filterChanged = new EventEmitter<PermissionFilterValue>();

  searchTerm = '';
  selectedGroup = '';

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.emitFilter();
  }

  onGroupChange(value: string): void {
    this.selectedGroup = value;
    this.emitFilter();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedGroup = '';
    this.emitFilter();
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedGroup.length > 0
    );
  }

  private emitFilter(): void {
    this.filterChanged.emit({
      searchTerm: this.searchTerm.trim(),
      groupName: this.selectedGroup
    });
  }
}