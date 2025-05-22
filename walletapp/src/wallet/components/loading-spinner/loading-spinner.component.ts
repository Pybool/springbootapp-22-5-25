import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss'
})
export class LoadingSpinnerComponent {
  @Input() isLoading: boolean = false;
  @Input() isPartial: boolean = false;
  @Input() blurFactor: string | null = null; // Set to '10px' or any value, or null for no blur
}
