import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-administration-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './administration-card.html',
  styleUrl: './administration-card.css'
})
export class AdministrationCard {
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input({ required: true }) route = '';
  @Input() icon = '';
  @Input() actionLabel = 'Manage';
}