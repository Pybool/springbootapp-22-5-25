import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './share-modal.component.html',
  styleUrl: './share-modal.component.scss'
})
export class ShareModalComponent {
  @Input() title:string = "Share Referral Link"
  @Input() contentUrl: string | null = null;
  @Output() shareClose = new EventEmitter<string | null>(); // Notify parent when closed

  isMobile: boolean = window.innerWidth <= 768;

  generateShareLink(platform: string): string {
    const encodedUrl = encodeURIComponent(this.contentUrl!);

    switch (platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodedUrl}`;
      case 'telegram':
        return `https://t.me/share/url?url=${encodedUrl}`;
      case 'instagram':
        return `https://www.instagram.com/?url=${encodedUrl}`;
      case 'x':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}`;
      default:
        return this.contentUrl!;
    }
  }

  closeModal(event: MouseEvent): void {
    this.contentUrl = null
    this.shareClose.emit(this.contentUrl)
    event.stopPropagation();
    // Logic to close modal
  }

  preventClose(event: MouseEvent): void {
    event.stopPropagation();
  }
}
