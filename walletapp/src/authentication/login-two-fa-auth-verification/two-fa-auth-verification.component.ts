import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarService } from '../../services/snackbar.service';
import { take } from 'rxjs';
import { OtpInputComponent } from '../../wallet/components/otp-input/otp-input.component';
import { LoadingSpinnerComponent } from '../../wallet/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login-two-fa-auth-verification',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    OtpInputComponent,
    LoadingSpinnerComponent,
  ],
  providers: [AuthService, SharedService],
  templateUrl: './two-fa-auth-verification.component.html',
  styleUrl: './two-fa-auth-verification.component.scss',
})
export class LoginTwoFaAuthVerificationComponent {
  data = '';
  email: any = null;
  showSpinner: boolean = false;
  showOtpSpinner: boolean = false;
  pinVerificationMsg: any = null;
  faShield = null;
  faLock = null;
  faExclamationTriangle = null;
  otpText: string = 'Resend one time password';
  timeLeft: number = 30;
  accountId: string | null = null;
  otpChannel: string = 'email';
  otpChannelMsg: string = 'email address';
  isRegister: string = '';
  isFullPageSpinnerLoading = false;
  redirectUri: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sharedService: SharedService,
    private authService: AuthService,
    private snackbar: SnackBarService
  ) {}

  ngOnInit() {
    this.email = window.localStorage.getItem("login-verify")
  }

  ngAfterViewInit() {
    const body = document.querySelector('body') as any;
    body.style.background =
      'linear-gradient(90deg, #FDBB2D 0%, #3A1C71 100%)!important;';
  }

  async submit() {
    this.isFullPageSpinnerLoading = true;
    this.authService
      .loginTwofaSignInVerification(
        this.data,
        this.email!
      )
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.onOtpSuccess(response);
        },
        (error: any) => {
          this.isFullPageSpinnerLoading = false;
          this.snackbar.showWithIcon(
            error?.error?.message ||
              'Otp code verification failed, please try to login again.'
          );
        }
      );
  }

  onOtpSuccess(response: any) {
    if (response.status) {
      this.showOtpSpinner = false;
      this.authService.storeTokens(response);
      this.authService.storeUser(response.data);
      this.authService.setLoggedIn(true);
      localStorage.removeItem('logoutInProgress');//Just added
      this.snackbar
        .show(response.message || 'Login was successfull')
        .then(() => {
          this.router.navigate(['/wallet']); // Default home page
        });
    } else {
      this.isFullPageSpinnerLoading = false;
      this.snackbar.show(
        'Invalid or expired otp code, request for a new OTP code',
        true
      );
    }
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
        this.timeLeft -= 1;
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
