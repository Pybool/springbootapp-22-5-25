import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtpInputComponent } from '../otp-input/otp-input.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { SharedService } from '../../../services/shared.service';
import { AuthService } from '../../../services/auth.service';
import { SnackBarService } from '../../../services/snackbar.service';
// import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-otp-authorize',
  templateUrl: './otp-authorize.component.html',
  styleUrls: ['./otp-authorize.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    OtpInputComponent,
 
  ],
  providers: [AuthService, SharedService],
})
export class OtpAuthorizeComponent implements OnInit, OnDestroy {
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
  accountId:string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private sharedService: SharedService,
    private authService: AuthService,
    private snackbar: SnackBarService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if(!params){
        return this.router.navigate(['/signup'])
      }
      this.accountId = params['account_id'];
      return null;
    });
  }

  ngAfterViewInit() {
    const body = document.querySelector('body') as any;
    body.style.background = 'linear-gradient(90deg, #FDBB2D 0%, #3A1C71 100%)!important;'
  }

  submit() {
    const data = { otp: this.data, accountId: this.accountId! };
    this.authService
      .verifyAccount(data)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.snackbar.hide()
        if (response.status) {
          this.snackbar.show(response?.message).then(()=>{
            this.router.navigateByUrl("/signin")
          })
        } else {
          this.snackbar.show(response?.message, true)
        }
      },(error:any)=>{
        this.snackbar.show(error?.error?.message || "Failed to verify your account, try again later", true)
      });
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
      .resendOtp({ accountId: this.accountId })
      .pipe(take(1))
      .subscribe((response: any) => {
        this.showOtpSpinner = false;
        if(response.status){
          this.data = '';
          this.countDownOtp();
        }
        else{
          otpLinkTextEl.style.color = 'steelblue';
          otpLinkTextEl.style.pointerEvents = 'auto';
          this.snackbar.show("Failed to resend otp, try again later", true)
        }
      }, ((error)=>{
        this.showOtpSpinner = false;
        otpLinkTextEl.style.color = 'steelblue';
        otpLinkTextEl.style.pointerEvents = 'auto';
        this.snackbar.show("Failed to resend otp, try again later", true)
      }));
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

  ngOnDestroy(): void {
    // Disconnect from WebSocket when the component is destroyed
    // this.webSocketService.disconnect();
  }
}
