import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IWallet } from '../../wallet.interfaces';
import { AuthService } from '../../../services/auth.service';
import { SharedService } from '../../../services/shared.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { take } from 'rxjs';
import { SnackBarService } from '../../../services/snackbar.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { PaystackService } from '../../../services/paystack.service';
let self: any = null;

@Component({
  selector: 'app-card-funding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-funding.component.html',
  styleUrl: './card-funding.component.scss',
})
export class CardFundingComponent {
  public amount: number | null = null;
  public isNaN = isNaN;
  public Number = Number;
  public user: any = null;
  @Input() wallet: IWallet = {};
  @Input() isVisible = false;
  public showSpinner: boolean = false;
  private _window: any = window;
  public transactionId: string = '';
  public marketplaceUrl:string = environment.marketplaceUrl;

  constructor(
    private authService: AuthService,
    public sharedService: SharedService,
    private snackBarService: SnackBarService,
    private walletService: WalletService,
    private paystackService: PaystackService
  ) {}

  ngOnInit() {
    self = this;
    this.user = this.authService.retrieveUser();
  }

  continueWithCardFunding() {
    this.paystackService.initiatePayment((this.amount!), this.wallet.account.email, (response: any) => {
      if (response.status === 'success') {
        this.paystackService
          .verifyTransaction(
            response.reference,
            (this.amount! * 100),//convert to kobo
            this.wallet.currency || 'NGN',
          )
          .pipe(take(1))
          .subscribe(
            (verifyResponse: any) => {
              self.snackBarService.show(verifyResponse.message, !verifyResponse.status)
            },
            (error: any) => {
              self.snackBarService.show('Payment verification failed', true);
            }
          );
      } else {
        this.snackBarService.show(
          'Transaction could not be completed',
          true,
          0
        );
      }
    })
  
  }
  
}
