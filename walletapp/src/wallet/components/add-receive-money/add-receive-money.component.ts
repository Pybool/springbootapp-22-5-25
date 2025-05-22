import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SnackBarService } from '../../../services/snackbar.service';
import { IWallet } from '../../wallet.interfaces';

import { Pipe, PipeTransform } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { CardFundingComponent } from '../card-funding/card-funding.component';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { AuthService } from '../../../services/auth.service';

@Pipe({
  name: 'formatNumbers',
  standalone: true,
})
export class FormatNumbersPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Split the string into letters and numbers
    const letters = value.replace(/[0-9]/g, '');
    const numbers = value.replace(/[^0-9]/g, '');

    // Format the numbers (add spaces or commas for readability)
    const formattedNumbers = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${letters}${formattedNumbers}`;
  }
}

@Component({
  selector: 'app-add-receive-money',
  standalone: true,
  imports: [
    CommonModule,
    FormatNumbersPipe,
    CardFundingComponent,
    ShareModalComponent,
  ],
  templateUrl: './add-receive-money.component.html',
  styleUrl: './add-receive-money.component.scss',
})
export class AddReceiveMoneyComponent {
  @Input() isVisible = false; 
  // Control visibility from the parent component
  @Input() wallet: IWallet = {};
  @Output() close = new EventEmitter<string>(); // Notify parent when closed
  public showAccountIdentification: boolean = false;
  public serverUrl: string = environment.api;
  @Output() cardFundingVisisble: boolean = false;
  contentUrl: string | null = null;
  user: any = null;

  constructor(
    private snackBarService: SnackBarService,
    public sharedService: SharedService,
    private authService: AuthService
  ) {
    this.user = this.authService.retrieveUser();
  }

  toggleAccountIdentification() {
    this.showAccountIdentification = !this.showAccountIdentification;
  }

  closeModal(): void {}

  setContentUrl() {
    const user: any = this.user!;
    const url: string = `Hi,\nI'm using Crygoca to receive payments.\nHere are my account details
    
Account holder: ${user!.firstname} ${user!.lastname}

Account Number: ${this.wallet.walletAccountNo}

Provider: Crygoca.

Thanks
${user.firstname} ${user!.lastname}
    `;
    this.contentUrl = url;
  }

  handleShareClose($event: string | null) {
    this.contentUrl = $event;
  }

  handleBackEvent() {
    this.isVisible = true;
    this.cardFundingVisisble = false;
  }

  copyTextToClipBoard(text: string): void {
    // Copy the wallet address to the clipboard
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.snackBarService.showWithIcon('Wallet ID copied to clipboard');
        setTimeout(() => {
          this.snackBarService.hide();
        }, 2000);
      })
      .catch((error) => {
        // If an error occurs while copying, show an error message
        this.snackBarService.showWithIcon('Failed to copy Wallet ID');
        console.error('Error copying to clipboard: ', error);
      });
  }

  continueWithCardFunding() {
    this.cardFundingVisisble = true;
  }
}
