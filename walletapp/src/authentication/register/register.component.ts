import { HttpClientModule } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject, switchMap, take } from 'rxjs';
import { SnackBarService } from '../../services/snackbar.service';
import { environment } from '../../environments/environment';
import { LoadingSpinnerComponent } from '../../wallet/components/loading-spinner/loading-spinner.component';

interface IGoogleUser {
  email: string;
  firstname: string;
  lastname: string;
  fullname: string;
  avatar: string;
  googleId: string;
  createdAt?: Date;
  lastLogin?: Date;
}

var self: any;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordPattern =
  /^(?=.*[A-Z].*[A-Z])(?=.*[a-z].*[a-z].*[a-z])(?=.*[!@#$%^&*])(?=.*[0-9].*[0-9]).{8,}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements AfterViewInit, OnDestroy {
  activeTab: string = 'signin';
  passwordAgain: string = '';
  accepted = false;
  opacity = 0.5;
  pointerType = 'none';
  showtermsAndConditions = false;
  showLoginSpinner = false;
  showRegSpinner = false;
  isDirtyPassword = false;
  isDirtyEmail = false;
  isDirtyUserName = false;
  activeLogin = false;
  isLoading = false;
  isFullPageSpinnerLoading = false;
  isValidPassword = false;
  signUpButtonInActive = true;
  credentials: any = {
    email: '',
    username: '',
    password: '',
    referralCode: '',
    geoData: null,
  };
  loginCredentials: { email: string; password: string } = {
    email: '',
    password: '',
  };
  private usernameSubject = new Subject<string>();
  private usernameSubscription: any;
  public userNameError: string = '';
  public _window: any = window;
  public clientId: string = environment.OAUTH2_CLIENT_ID;
  public googleUser: IGoogleUser | null = null;
  public paswordTYpe = 'password';
  public paswordAgainTYpe = 'password';
  public showNext: boolean = true;
  public showNextSpinner: boolean = false;
  public usernameValid = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private snackbar: SnackBarService
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
            this.usernameValid = false;
          } else {
            this.usernameValid = true;
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
  
  }

  ngAfterViewInit(): void { }

  hideFullPageSpinner() {
    this.isFullPageSpinnerLoading = false;
    this.cdRef.detectChanges(); // Force UI update
  }

  showPassword(id: string, pflag: any = null) {
    const passwordEl = document.getElementById(id) as any;
    if (passwordEl) {
      passwordEl.setAttribute('type', 'text');
      if (!pflag) {
        return (this.paswordTYpe = 'text');
      }
      this.paswordAgainTYpe = 'text';
    }
    return null;
  }

  hidePassword(id: string, pflag: any = null) {
    const passwordEl = document.getElementById(id) as any;
    if (passwordEl) {
      passwordEl.setAttribute('type', 'password');

      if (!pflag) {
        return (this.paswordTYpe = 'password');
      }
      this.paswordAgainTYpe = 'password';
    }
    return null;
  }


  setSignUpActive() {
    const validation = {
      username: this.credentials.username.trim()=='',
      email: this.credentials.email.trim() == '',
      password: this.credentials.password.trim() == '',
      passwordValid: this.isValidPassword,
      termsAccepted: !this.accepted
    };

    // If any value is true, signUpButtonInActive should be true; otherwise, false
    this.signUpButtonInActive = Object.values(validation).some(Boolean);
  }

  register() {
    if (
      !this.accepted ||
      this.isInvalidEmail(this.credentials)
    ) {
      return null;
    }
    
    this.showRegSpinner = true;
    this.isFullPageSpinnerLoading = true;
    if (
      this.credentials.password.length >= 8
    ) {
     
      this.authService
        .register(this.credentials)
        .pipe(take(1))
        .subscribe(
          (response: any) => {
            this.showRegSpinner = false;
            if (response?.status) {
              this.hideFullPageSpinner();
              localStorage.setItem("register-verify", this.credentials.email);
              self.router.navigate(['/signup-verify-account']);
            } else {
              this.hideFullPageSpinner();
              this.snackbar.show(response.message, true);
            }
          },
          (error: any) => {
            this.hideFullPageSpinner();
            this.showRegSpinner = false;
            this.snackbar.show(
              'Something went wrong, we could not register you',
              true
            );
          }
        );
    } else {
      this.showRegSpinner = false;
      this.hideFullPageSpinner();
      alert('Invalid password/ Non matching password');
    }
    return null;
  }

  toggleTermsAndConditions() {
    this.showtermsAndConditions = !this.showtermsAndConditions;
  }

  toggleAccepted() {
    this.accepted = !this.accepted;
    if (
      this.accepted &&
      this.credentials?.geoData &&
      !this.isPasswordMatch() &&
      !this.isInvalidEmail(this.credentials) &&
      this.userNameError == '' &&
      !this.isDirtyUserName
    ) {
      this.setSignUpActive();
      this.opacity = 1;
      this.pointerType = 'auto';
      return;
    }
    this.setSignUpActive();
    this.opacity = 0.5;
    this.pointerType = 'none';
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

  isInvalidEmail(credentials: any) {
    try {
      if (credentials.email.trim().length > 0) {
        if (!emailRegex.test(credentials.email)) {
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
      if (this.credentials.password.trim().length > 0) {
        if (!passwordPattern.test(this.credentials.password)) {
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

  isPasswordMatch() {
    if (this.passwordAgain.trim() == '' && this.isDirtyPassword) {
      return true;
    }
    try {
      if (this.passwordAgain != this.credentials.password) {
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
    this.enableLoginButton();
  }

  dirtyPassword() {
    if (!this.isDirtyPassword) this.isDirtyPassword = true;
    if (
      this.accepted &&
      !this.isPasswordMatch() &&
      !this.isInvalidEmail(this.credentials)
    ) {
      this.setSignUpActive();
      this.opacity = 1;
      this.pointerType = 'pointer';
      return;
    }
    this.setSignUpActive();
    this.isValidPassword = this.isInvalidPassword();
    this.opacity = 0.5;
    this.pointerType = 'none';
  }

  isInvalidUserName(username: string) {
    this.isDirtyUserName = true;
    const usernameRegex =
      /^(?!.*[_.]{2})[a-zA-Z][a-zA-Z0-9._]{2,28}[a-zA-Z0-9]$/;
    this.usernameValid = false;

    if (username.length < 4) {
      this.userNameError = 'Username must be at least 4 characters';
    } else if (username.length > 30) {
      this.userNameError = 'Username must not exceed 30 characters';
    } else if (!usernameRegex.test(username)) {
      this.userNameError =
        'Username can only contain letters, numbers, underscores (_), or dots (.), must start with a letter, and cannot end with _ or .';
    } else {
      this.userNameError = '';
      this.usernameSubject.next(username);
    }
  }

  toggleShowNext() {
    this.showNextSpinner = true;
    this.showNext = !this.showNext;
    // Customize currency selector
    setTimeout(() => {
      const currencySelector = document.querySelector(
        '.opacity-toggle.select'
      ) as HTMLElement;
      console.log('currencySelector ===> ', currencySelector);

      if (currencySelector) {
        currencySelector.classList.add('currency-selector');
      }
      this.showNextSpinner = false;
    }, 500);
  }

  onCountryChange($event: any, type: string) {
    this.credentials.geoData = $event;
    this.setSignUpActive();
  }

  ngOnDestroy() {
    // Clean up the subscription to avoid memory leaks
    if (this.usernameSubscription) {
      this.usernameSubscription.unsubscribe();
    }
  }
}
