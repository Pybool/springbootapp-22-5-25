import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { WalletService } from '../../../services/wallet/wallet.service';
import { SnackBarService } from '../../../services/snackbar.service';
import { AuthService } from '../../../services/auth.service';
import { IWallet } from '../../wallet.interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { take } from 'rxjs';
import { WithdrawalOtpAuthComponent } from '../withdrawal-otp-auth/withdrawal-otp-auth.component';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-withdrawal',
  standalone: true,
  imports: [CommonModule, FormsModule, WithdrawalOtpAuthComponent],
  templateUrl: './withdrawal.component.html',
  styleUrl: './withdrawal.component.scss',
})
export class WithdrawalComponent {
  public amount: number = 0.00;
  public inValidReceipientAmount: boolean = true;
  public isNaN = isNaN;
  public Number = Number;
  public payload: any = {};
  public transferPayload: any = {};
  public user: any = null;
  public serverUrl: string = environment.api;
  @Input() wallet: IWallet = {};
  @Input() isVisible = false;
  @Output() close = new EventEmitter<string>();
  public withdrawalPayload: any = null;
  public showWithdrawalOtp: boolean = false;
  public showSpinner: boolean = false;

  constructor(
    private walletService: WalletService,
    private snackBarService: SnackBarService,
    private authService: AuthService,
    public sharedService: SharedService
  ) {}

  ngOnInit() {
    this.user = this.authService.retrieveUser();
  }

  closeModal(): void {
    this.isVisible = false;
    if(this.showWithdrawalOtp){
      this.showWithdrawalOtp = false;
    }
    this.close.emit("withdrawal");
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if withBeneficiaryData has changed and it's not null
  }

  buildTransferPayload() {
    this.showSpinner = true;
    const payload: any = {};
    if (this.user.geoData.code === 'NG') {
      payload.account_bank = this.user.bankInfo.bank.code;
      payload.account_number = this.user.bankInfo.accountNumber;
      payload.amount = this.amount;
      payload.narration = 'Crygoca Wallet Withdrawal';
      payload.currency = this.user.geoData.currency.code;
      payload.reference = null;
      payload.callback_url = '';
    } else if (this.user.geoData.code === 'GH') {
      payload.account_bank = this.user.bankInfo.bank.code;
      payload.account_number = this.user.bankInfo.accountNumber;
      payload.amount = this.amount;
      payload.narration = 'Crygoca Wallet Withdrawal';
      payload.currency = this.user.geoData.currency.code;
      payload.reference = null;
      payload.callback_url = '';
      payload.destination_branch_code = this.user.bankInfo.branch.branch_code;
      payload.beneficiary_name = this.user.bankInfo.accountName;
    } else if (this.user.geoData.code === 'ZA') {
      payload.account_bank = this.user.bankInfo.bank.code;
      payload.account_number = this.user.bankInfo.accountNumber;
      payload.amount = this.amount;
      payload.narration = 'Crygoca Wallet Withdrawal';
      payload.currency = this.user.geoData.currency.code;
      payload.reference = null;
      payload.callback_url = '';
      payload.beneficiary_name = this.user.bankInfo.accountName;
      payload.meta = [
        {
          first_name: this.user.firstname,
          last_name: this.user.lastname,
          email: this.user.email,
          mobile_number: this.user.phone,
          recipient_address: this.user.geoData.capital,
        },
      ];
    } else if (this.user.geoData.region === 'EU') {
      payload.amount = this.amount;
      payload.narration = 'Crygoca Wallet Withdrawal';
      payload.currency = this.user.geoData.currency.code;
      payload.reference = null;
      payload.beneficiary_name = this.user.bankInfo.accountName;
      payload.beneficiary_address = '';
      payload.meta = [
        {
          account_number: this.user.bankInfo.accountNumber,
          routing_number: this.user.bankInfo.swiftCode || this.user.bankInfo.routingNumber,
          swift_code: this.user.bankInfo.swiftCode,
          bank_name: this.user.bankInfo.bank.name,
          beneficiary_name: this.user.bankInfo.accountName,
          beneficiary_country: this.user.geoData.code,
          first_name:this.user.firstname,
          last_name:this.user.lastname,
          city: this.user.geoData.capital,
          postal_code: '',
          street_number: '',
          street_name: '',
          
          
        },
      ];
    } else if (this.user.geoData.code === 'US' || this.user.geoData.code === 'CA') {
      payload.amount = this.amount;
      payload.narration = 'Crygoca Wallet Withdrawal';
      payload.currency = this.user.geoData.currency.code;
      payload.reference = null;
      payload.beneficiary_name = this.user.bankInfo.accountName;
      payload.meta = [
        {
          account_number: this.user.bankInfo.accountNumber,
          routing_number: this.user.bankInfo.routingNumber,
          swift_code: this.user.bankInfo.swiftCode,
          bank_name: this.user.bankInfo.bank.name,
          beneficiary_name: this.user.bankInfo.accountName,
          beneficiary_country: this.user.geoData.code,
        },
      ];
    }
    this.withdrawalPayload = payload;
    const payloadHash = this.walletService.hashWithdrawalPayload(this.withdrawalPayload);
    this.walletService
      .sendWithdrawalOtp(payloadHash)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.showSpinner = false;
          if (response.status) {
            this.showWithdrawalOtp = true;
          } else {
            this.snackBarService.showWithIcon(
              'Failed to initaite withdrawal authorization request.'
            );
          }
        },
        (error: any) => {
          this.showSpinner = false;
          this.snackBarService.showWithIcon(
            'Failed to initaite withdrawal authorization request.'
          );
        }
      );    
  }
}
