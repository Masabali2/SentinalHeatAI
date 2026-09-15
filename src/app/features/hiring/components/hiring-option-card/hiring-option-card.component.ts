import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-hiring-option-card',
  standalone: true,
  templateUrl: './hiring-option-card.component.html',
  styleUrl: './hiring-option-card.component.css'
})
export class HiringOptionCardComponent {

  @Input({ required: true }) icon!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) buttonLabel!: string;
  @Input() variant: 'primary' | 'secondary' = 'primary';

  @Output() selected = new EventEmitter<void>();

  select(): void {
    this.selected.emit();
  }
}