import { Component, Input } from '@angular/core';
import { Ivirtualcard } from './virtual-card.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-virtual-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './virtual-card.component.html',
  styleUrl: './virtual-card.component.scss'
})
export class VirtualCardComponent {

  @Input() virtualCard:Ivirtualcard = {}

  formatBin(bin?: string): string[] {
    return bin!.match(/.{1,4}/g) || [];  // Splits into groups of 4
  }

}
