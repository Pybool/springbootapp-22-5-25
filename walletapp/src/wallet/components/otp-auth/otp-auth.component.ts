import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OtpInputComponent } from '../otp-input/otp-input.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { SnackBarService } from '../../../services/snackbar.service';
import { take } from 'rxjs';
import { PurpleSpinnerComponent } from '../purple-spinner/purple-spinner.component';
import { WalletService } from '../../../services/wallet/wallet.service';

@Component({
  selector: 'app-otp-auth',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    OtpInputComponent,
    PurpleSpinnerComponent,
  ],
  templateUrl: './otp-auth.component.html',
  styleUrl: './otp-auth.component.scss',
})
export class OtpAuthComponent {
  data = '';
  @Input() payload: any = {};
  email: any = null;
  transferInProgress: boolean = false;
  transferSuccess: boolean = false;
  transferFailed: boolean = false;
  showSpinner: boolean = false;
  showOtpSpinner: boolean = false;
  pinVerificationMsg: any = null;
  otpText: string = 'Resend one time password';
  timeLeft: number = 30;
  accountId: string | null = null;
  otpChannel: string = 'email';
  otpChannelMsg: string = 'email address';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackbar: SnackBarService,
    private walletService: WalletService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (!params || !params['accountId']) {
        // return this.router.navigate(['signin']);
      }
      this.otpChannel = params['type'] || 'email';
      if (this.otpChannel === 'sms') {
        this.otpChannelMsg = 'phone number';
      }
      this.accountId = params['accountId'];
      // this.resendOtp();
      return null;
    });
  }

  ngAfterViewInit() {
    const body = document.querySelector('body') as any;
    body.style.background =
      'linear-gradient(90deg, #FDBB2D 0%, #3A1C71 100%)!important;';
  }

  submit() {
    this.transferInProgress = true;
    const transferIntent: {
      walletToDebit: string;
      walletToCredit: string;
      otp: string;
    } = {
      walletToDebit: this.payload.debitDetails.walletAccountNo,
      walletToCredit: this.payload.creditDetails.walletAccountNo,
      otp: this.data,
    };
    this.payload.otp = transferIntent.otp;
    console.log('Transfer Payload ====> ', this.payload);
    this.walletService.transferMoney(this.payload).pipe(take(1))
    .subscribe((transferResponse:any)=>{
      if(transferResponse.status){
        this.transferSuccess = true;
      }else{
        this.transferFailed = true;
      }
    },
    (error: any) => {
      this.transferFailed = true;
    })
    // this.walletService
    //   .verifyTransferOtp(transferIntent)
    //   .pipe(take(1))
    //   .subscribe(
    //     (response: any) => {
    //       if (response.status) {
    //         this.walletService.transferMoney(this.payload).pipe(take(1)).subscribe((transferResponse:any)=>{
    //           if(transferResponse.status){
    //             this.transferSuccess = true;
    //           }else{
    //             this.transferFailed = true;
    //           }
    //         },
    //         (error: any) => {
    //           this.transferFailed = true;
    //         })
            
    //       } else {
    //         this.snackbar.show("Tranfer authorization failed", true);
    //         this.transferInProgress = false;
    //       }
    //     },
    //     (error: any) => {
    //       this.snackbar.show("Tranfer authorization failed", true);
    //       this.transferInProgress = false;
    //     }
    //   );
  }

  resendOtp() {
    const otpLinkTextEl = document.querySelector(
      '.otp-link-text'
    ) as HTMLElement;
    otpLinkTextEl.style.color = 'gray';
    otpLinkTextEl.style.pointerEvents = 'none';
    otpLinkTextEl.setAttribute('disabled', 'true');
    this.showOtpSpinner = true;
    this.authService
      .resendtwoFaLoginOtp({
        accountId: this.accountId,
        otpChannel: this.otpChannel,
      })
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.showOtpSpinner = false;
          if (response.status) {
            this.data = '';
            this.countDownOtp();
          } else {
            otpLinkTextEl.style.color = 'steelblue';
            otpLinkTextEl.style.pointerEvents = 'auto';
            this.snackbar.show(
              'Failed to resend otp, try again later',
              true,
              0
            );
          }
        },
        (error: any) => {
          this.showOtpSpinner = false;
          otpLinkTextEl.style.color = 'steelblue';
          otpLinkTextEl.style.pointerEvents = 'auto';
          this.snackbar.show('Failed to resend otp, try again later', true);
        }
      );
  }

  countDownOtp() {
    const intervalId = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft -= 1; // Concise decrement
        this.otpText = `Resend code in ${this.timeLeft} seconds`;
      } else {
        const otpLinkTextEl = document.querySelector(
          '.otp-link-text'
        ) as HTMLElement;
        otpLinkTextEl.style.color = 'steelblue';
        otpLinkTextEl.style.pointerEvents = 'auto';
        this.otpText = `Resend code`;
        otpLinkTextEl.setAttribute('disabled', 'false');
        clearInterval(intervalId);
        this.timeLeft = 30;
      }
    }, 1000);
  }

  
}
