import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject, switchMap, take } from 'rxjs';
import { SnackBarService } from '../../services/snackbar.service';
import { environment } from '../../environments/environment';
import { LoadingSpinnerComponent } from '../../wallet/components/loading-spinner/loading-spinner.component';


var self: any;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern =
  /^(?=.*[A-Z].*[A-Z])(?=.*[a-z].*[a-z].*[a-z])(?=.*[!@#$%^&*])(?=.*[0-9].*[0-9]).{8,}$/;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent
  ],
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  activeTab: string = 'signin';
  passwordAgain: string = '';
  accepted:boolean = false;
  opacity = 0.5;
  pointerType = 'none';
  showtermsAndConditions = false;
  isFullPageSpinnerLoading = false;
  showLoginSpinner = false;
  showRegSpinner = false;
  isDirtyPassword = false;
  isDirtyEmail = false;
  isDirtyUserName = false;
  activeLogin = false;
  isLoading = false;
  credentials: any = {
    email: '',
    username: '',
    password: '',
  };
  loginCredentials: { email: string; password: string } = {
    email: '',
    password: '',
  };
  private usernameSubject = new Subject<string>();
  private usernameSubscription: any;
  public userNameError: string = '';
  public _window: any = window;
  public paswordTYpe = 'password';
  public inactivityReason: string | null = null;
  public logoutReason: string | null = null;
  public showCurrencySelection: boolean = false;
  public user: any = null;
  public redirectUri: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: SnackBarService,
    private cdRef: ChangeDetectorRef
  ) {
    self = this;
    this.usernameSubscription = this.usernameSubject
      .pipe(
        debounceTime(600), // Debounce for 1.3 seconds
        switchMap((userName) => {
          this.isLoading = true; // Set loading state
          return this.authService.checkUserNameExists(userName); // Return the observable
        })
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false; // Stop loading state
          if (response.data > 0) {
            this.userNameError = 'This username is not available';
          } else {
            this.userNameError = '';
            this.isDirtyUserName = false;
          }
        },
        error: (err) => {
          this.isLoading = false; // Stop loading on error
          this.userNameError = 'An error occurred while checking the username.';
          console.error(err);
        },
      });
  }

  ngOnInit() {
    this.authService.logout(false);
  }

  hideFullPageSpinner() {
    this.isFullPageSpinnerLoading = false;
    this.cdRef.detectChanges(); // Force UI update
    return this.cdRef.detectChanges();
  }

  async login() {
    this.showLoginSpinner = true;
    this.isFullPageSpinnerLoading = true;
    (await this.authService.login(this.loginCredentials))
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          this.isFullPageSpinnerLoading = false;
          this.showLoginSpinner = false;
          if (response.status) {
            localStorage.setItem("login-verify", this.loginCredentials.email);
            this.router.navigate(['/signin-verify-account']);
          }
          this.snackbar.show(
            response.message,
            !response.status
          );
          return null;
        },
        (error: any) => {
          this.isFullPageSpinnerLoading = false;
          this.showLoginSpinner = false;
          this.snackbar.show(
            'Authenticationn failed, please try again later',
            true,
            0
          );
        }
      );
  }

  toggleTermsAndConditions() {
    this.showtermsAndConditions = !this.showtermsAndConditions;
  }

  showPassword() {
    const passwordEl = document.getElementById('password') as any;
    if (passwordEl) {
      passwordEl.setAttribute('type', 'text');
      this.paswordTYpe = 'text';
    }
  }

  hidePassword() {
    const passwordEl = document.getElementById('password') as any;
    if (passwordEl) {
      passwordEl.setAttribute('type', 'password');
      this.paswordTYpe = 'password';
    }
  }

  toggleAccepted() {   
    if(this.areCredentialsValid()){
      this.accepted = true
      if (
        this.accepted &&
        !this.isPasswordMatch() &&
        !this.isInvalidEmail(this.credentials) &&
        this.userNameError == '' &&
        !this.isDirtyUserName
      ) {
        this.opacity = 1;
        this.pointerType = 'auto';
        return;
      }
      this.opacity = 0.5;
      this.pointerType = 'none';
    }else{
      this.accepted = false
      const accepted = document.getElementById("accepted") as any;
      if(accepted){
        accepted.checked = false;
        this.snackbar.show("Please enter a valid email and password.")
      }
    }
    
  }

  requirederrors(field: string) {
    try {
      if (this.credentials[field].length == 0) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  isInvalidEmail(loginCredentials: any) {
    try {
      if (loginCredentials.email.trim().length > 0) {
        if (!emailRegex.test(loginCredentials.email)) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  isInvalidPassword() {
    try {
      if (this.loginCredentials.password.trim().length > 0) {
        if (!passwordPattern.test(this.loginCredentials.password)) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  _isInvalidEmail(): boolean {
    try {
      const email = this.loginCredentials.email?.trim();
      return !(email && emailRegex.test(email));
    } catch {
      return true;
    }
  }

  _isInvalidPassword(): boolean {
    try {
      const password = this.loginCredentials.password?.trim();
      return !(password && passwordPattern.test(password));
    } catch {
      return true;
    }
  }

  areCredentialsValid(): boolean {
    return !this._isInvalidEmail() && !this._isInvalidPassword();
  }

  isPasswordMatch() {
    if (this.passwordAgain.trim() == '' && this.isDirtyPassword) {
      return true;
    }
    try {
      if (this.passwordAgain != this.credentials.password) {
        this.accepted = false;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  enableLoginButton() {
    this.activeLogin =
      this.loginCredentials.password.trim() != '' &&
      !this.isInvalidEmail(this.loginCredentials);
  }

  dirtyEmail(credentials: any) {
    if (!this.isDirtyEmail) this.isDirtyEmail = true;
    if (
      this.accepted &&
      !this.isPasswordMatch() &&
      !this.isInvalidEmail(credentials)
    ) {
      this.opacity = 1;
      this.pointerType = 'pointer';
      return;
    }
    this.opacity = 0.5;
    this.pointerType = 'none';
    //
    this.enableLoginButton();
  }

  dirtyPassword() {
    if (!this.isDirtyPassword) this.isDirtyPassword = true;
    if (
      this.accepted &&
      !this.isPasswordMatch() &&
      !this.isInvalidEmail(this.credentials)
    ) {
      this.opacity = 1;
      this.pointerType = 'pointer';
      return;
    }
    this.opacity = 0.5;
    this.pointerType = 'none';
  }

  isInvalidUserName(username: string) {
    this.isDirtyUserName = true;
    this.toggleAccepted();
    this.usernameSubject.next(username);
  }

  ngOnDestroy() {
    // Clean up the subscription to avoid memory leaks
    if (this.usernameSubscription) {
      this.usernameSubscription.unsubscribe();
    }
  }
}
