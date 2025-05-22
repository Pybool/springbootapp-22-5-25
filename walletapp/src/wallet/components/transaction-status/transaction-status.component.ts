import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-status.component.html',
  styleUrl: './transaction-status.component.scss'
})
export class TransactionStatusComponent {
   @Input() notificationType = true;

}
