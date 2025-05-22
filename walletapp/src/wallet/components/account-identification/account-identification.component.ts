import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { TransactionStatusComponent } from '../transaction-status/transaction-status.component';
import { FormsModule } from '@angular/forms';
import { WalletService } from '../../../services/wallet/wallet.service';
import { take } from 'rxjs';
import { SnackBarService } from '../../../services/snackbar.service';
import { AuthService } from '../../../services/auth.service';
import { OtpAuthComponent } from '../otp-auth/otp-auth.component';
import { IWallet } from '../../wallet.interfaces';
import { PurpleSpinnerComponent } from '../purple-spinner/purple-spinner.component';
import { SharedService } from '../../../services/shared.service';
@Component({
  selector: 'app-account-identification',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TransactionStatusComponent,
    OtpAuthComponent,
    PurpleSpinnerComponent,
  ],
  templateUrl: './account-identification.component.html',
  styleUrl: './account-identification.component.scss',
})
export class AccountIdentificationComponent implements OnDestroy {
  @Input() wallet: IWallet = {};
  @Input() isVisible = false; // Control visibility from the parent component
  @Input() withBeneficiaryData: any = null;
  @Output() back = new EventEmitter<void>(); // Notify parent when closed
  public serverUrl: string = environment.api;
  public receipientWallet: any = null;
  public showSuccessOrFail: boolean = false;
  public isSuccess: boolean = true;
  public user: any = null;
  public walletId: string = '';
  public validWalletId: boolean = false;
  public walletIdDirty: boolean = false;
  public displayValue: string = ''; // Holds the current value of the input box
  public keys: (string | number)[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, '●', 0]; // Keypad keys
  public showConversionSpinner: boolean = false;
  public showOtpAuth: boolean = false;
  public saveBeneficiary: boolean = false;
  public conversionMessage: string = '';
  public receipientAmount: number | null = null;
  public exchangeRateData: any = null;
  public rate: number = 0.0;
  public inValidReceipientAmount: boolean = true;
  public isNaN = isNaN;
  public Number = Number;
  public payload: any = {};
  public transferPayload: any = {};
  public continueWithAuthSpinner: boolean = false;
  public showFetchingWalletSpinner: boolean = false;
  public walletAccountNoErrorMsg: string = 'No valid wallet Id';

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
    if (!this.showOtpAuth) {
      this.isVisible = false;
      this.receipientWallet = null;
      this.showSuccessOrFail = false;
      this.isSuccess = true;
      this.back.emit();
    } else {
      this.showOtpAuth = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if withBeneficiaryData has changed and it's not null
    console.log(changes['withBeneficiaryData'], this.withBeneficiaryData);
    if (changes['withBeneficiaryData'] && this.withBeneficiaryData) {
      this.receipientWallet =
        this.withBeneficiaryData.receipientWallet?.receiverWallet;
      this.convertRates();
    }
  }

  // Handles keypress events
  onKeyPress(key: string | number): void {
    // Limit the input to valid amount format
    if (key === '●') {
      key = '.';
    }
    if (
      (typeof key === 'number' || key === '.') &&
      this.isValidInput(key.toString())
    ) {
      this.displayValue += key;
    }
    this.convertRates();
  }

  toggleSaveBeneficiary() {
    this.saveBeneficiary = !this.saveBeneficiary;
    this.snackBarService.show(
      `Setting show beneficiary to ${this.saveBeneficiary}`
    );
  }

  // Validates the input to ensure proper number formatting
  isValidInput(newKey: string): boolean {
    const newValue = this.displayValue + newKey;
    const regex = /^\d*\.?\d{0,2}$/; // Matches numbers with up to two decimal places
    return regex.test(newValue);
  }

  proceed() {
    this.showFetchingWalletSpinner = true;
    this.walletService
      .getReceipientWalletDetails(this.walletId)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.showFetchingWalletSpinner = false;
          if (response.status) {
            this.receipientWallet = response.data;
            this.convertRates();
          } else {
            this.snackBarService.show(response?.message, true);
            this.receipientWallet = null;
          }
        },
        (error: any) => {
          this.showFetchingWalletSpinner = false;
          this.receipientWallet = null;
        }
      );
  }

  public getCountryCodeByCurrencyCode(array: any, code: string) {
    return array.find((item: any) => item?.currency?.code === code);
  }

  convertRates() {
    this.conversionMessage = 'Conversion was successful';
  }

  continueWithAuth() {
    this.continueWithAuthSpinner = true;
    this.transferPayload = {
      debitDetails: {
        walletAccountNo: this.wallet.walletAccountNo,
      },
      creditDetails: {
        walletAccountNo: this.receipientWallet?.walletAccountNo,
      },
      sourceAmount: Number(this.displayValue),
      sourceCurrency: this.receipientWallet.currency?.toUpperCase(),
      targetCurrency:
        this.receipientWallet?.currency?.toUpperCase(),
      saveBeneficiary: this.saveBeneficiary,
    };

    const transferIntent: {
      walletToDebit: string;
      walletToCredit: string;
      amount:number
    } = {
      walletToDebit: this.transferPayload.debitDetails.walletAccountNo,
      walletToCredit: this.transferPayload.creditDetails.walletAccountNo,
      amount: this.transferPayload.sourceAmount
    };

    this.walletService
      .sendTransferOtp(transferIntent)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.continueWithAuthSpinner = false;
          if (response.status) {
            this.showOtpAuth = true;
          } else {
            this.snackBarService.showWithIcon(
              'Failed to initaite transfer authentication request.'
            );
          }
        },
        (error: any) => {
          this.continueWithAuthSpinner = false;
          this.snackBarService.showWithIcon(
            'Failed to initaite transfer authentication request.'
          );
        }
      );

    // this.showSuccessOrFail = !this.showSuccessOrFail;
    // this.isSuccess = true; //Math.random() > 0.5; // Randomly set to true (50%) or false (50%)
  }



  validateAccountNumber(): boolean | null {
    this.walletAccountNoErrorMsg = '';
    this.walletIdDirty = true; // Mark the field as dirty for validation purposes
  
    // Define regex patterns for the old and new account number formats
    const oldAccountRegex = /^234\d{7}$/; // Old account number format
  
    // Check if the walletId matches either of the formats
    const isOldAccountValid = oldAccountRegex.test(this.walletId);
  
    if (!isOldAccountValid) {
      this.validWalletId = false;
      this.walletAccountNoErrorMsg = `Invalid account number: '${this.walletId}' must match either the format (234XXXXXXX) (13 digits).`;
      return null;
    }
  
    // If all checks pass for the new account format
    this.walletAccountNoErrorMsg = '';
    this.validWalletId = true;
    return this.validWalletId;
  }
  

  // Handles delete (backspace) events
  onDelete(): void {
    this.displayValue = this.displayValue.slice(0, -1);
    this.convertRates();
  }

  ngOnDestroy(): void {}
}
