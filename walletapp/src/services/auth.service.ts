import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  tokenKey: string = 'javapp-accessToken';
  userKey: string = 'user';
  loggedIn: boolean = false;
  loggedIn$: any = new BehaviorSubject(false);
  vendorSubscription: boolean = false;
  vendorSubscription$: any = new BehaviorSubject(false);
  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
  ) {}

  setLoggedIn(status: boolean) {
    this.loggedIn = status;
    this.loggedIn$.next(this.loggedIn);
  }

  getAuthStatus() {
    return this.loggedIn$.asObservable();
  }

  async login(credentials: any) {
    return this.http.post(`${environment.api}/auth/login`, credentials);
  }

  register(user: any) {
    return this.http.post(`${environment.api}/auth/register`, user);
  }

  resendOtp(user: any) {
    return this.http.post(
      `${environment.api}/api/v1/auth/resend-email-verification-otp`,
      user
    );
  }

  sendResetPasswordOtp(payload: { email: string }) {
    return this.http.post(
      `${environment.api}/api/v1/auth/send-reset-password-otp`,
      payload
    );
  }

  verifyResetPasswordOtp(payload: { email: string; otp: number }) {
    return this.http.post(
      `${environment.api}/api/v1/auth/verify-reset-password-otp`,
      payload
    );
  }

  resetPassword(payload: { uid: string; token: string; password: string }) {
    return this.http.post(
      `${environment.api}/api/v1/auth/reset-password`,
      payload
    );
  }

  verifyAccount(payload: { accountId: string; otp: string | number }) {
    return this.http.put(
      `${environment.api}/api/v1/auth/verify-account`,
      payload
    );
  }

  resendtwoFaLoginOtp(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/auth/resend-2fa-signin-otp`,
      payload
    );
  }

  twofaSignInVerification(
    otp: string,
    email: string
  ) {
    return this.http.post(`${environment.api}/auth/registration-verify-otp`, {
      otp,
      email
    });
  }

  loginTwofaSignInVerification(
    otp: string,
    email: string
  ) {
    return this.http.post(`${environment.api}/auth/login-verify-otp`, {
      otp,
      email
    });
  }

  validatePhoneNumber(phoneNumber: string, areaCode: any): boolean {
    const parsedNumber = parsePhoneNumberFromString(phoneNumber, areaCode);

    if (parsedNumber && parsedNumber.isValid()) {
      return true;
    } else {
      return false;
    }
  }

  deactivateAccount(accountId: string) {
    return this.http.patch(`${environment.api}/api/v1/accounts/deactivate`, {
      accountId,
    });
  }

  getUserFromDb(accountId: string) {
    return this.http.get(
      `${environment.api}/api/v1/auth/getUser?accountId=${accountId}`
    );
  }

  checkUserNameExists(userName: string) {
    return this.http.post(`${environment.api}/api/v1/auth/check-username`, {
      userName,
    });
  }

  updateProfile(user: any) {
    return this.http.put(`${environment.api}/api/v1/auth/user-profile`, user);
  }

  retrieveToken(tokenKey: string) {
    if (
      this.cookieService.get(tokenKey) &&
      this.cookieService.get(tokenKey) != ''
    ) {
      return this.cookieService.get(tokenKey);
    } else {
      return null;
    }
  }

  refresh() {
    const refreshToken = this.retrieveToken('javapp-refreshToken');
    return this.http.post(`${environment.api}/api/v1/auth/refresh-token`, {
      refreshToken,
    });
  }

  storeTokens(loginResponse: any, storeRefresh = true) {
    this.cookieService.set('javapp-accessToken', loginResponse?.data || loginResponse?.token);
    if (storeRefresh) {
      this.cookieService.set(
        'javapp-refreshToken',
        loginResponse?.refreshToken
      );
    }
  }

  clearAllStorages(){
    this.removeUser();
    this.removeToken();
    this.logout(false);
    window.localStorage.clear();
    window.localStorage.setItem("breaking-change", '1');
    this.cookieService.deleteAll('/');
    console.log("Cleared all strorages ===>")
  }

  logout(redirect: boolean) {
    this.removeUser();
    this.setLoggedIn(false);
    this.cookieService.delete('javapp-accessToken');
    this.cookieService.delete('javapp-refreshToken');
    if (redirect) {
      return (document.location.href = '/signin');
    }
    return null;
  }

  removeToken() {
    this.cookieService.delete(this.tokenKey);
  }

  storeUser(user: any) {
    this.cookieService.set(this.userKey, JSON.stringify(user));
  }

  retrieveUser() {
    try {
      const user = this.cookieService.get(this.userKey);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  removeUser() {
    this.cookieService.delete(this.userKey);
  }

  navigateToUrl(url: string) {
    this.router.navigateByUrl(url);
  }
}
