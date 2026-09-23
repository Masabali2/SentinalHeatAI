import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-administration-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './administration-stat-card.html',
  styleUrl: './administration-stat-card.css'
})
export class AdministrationStatCard {
  @Input({ required: true }) title = '';
  @Input({ required: true }) value: number | string = 0;
  @Input() description = '';
  @Input() icon = '';
}