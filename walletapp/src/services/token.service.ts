import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { catchError, from, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private tokenKey = 'javapp-accessToken';
  private refreshTokenKey = 'javapp-refreshToken';
  userKey: string = 'user';

  constructor(private cookieService: CookieService, private router: Router) {}

  navigateToUrl(url: string) {
    this.router.navigateByUrl(url);
  }

  storeTokens(loginResponse: any, storeRefresh = true) {
    this.cookieService.set('javapp-accessToken', loginResponse?.data || loginResponse?.token);
    if (storeRefresh) {
      this.cookieService.set(
        'javapp-refreshToken',
        loginResponse.refreshToken
      );
    }
  }

  removeTokens() {
    this.cookieService.delete(this.tokenKey);
    this.cookieService.delete(this.refreshTokenKey);
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

  async refresh() {
    const refreshToken = this.retrieveToken('javapp-refreshToken');
    if (refreshToken == undefined || refreshToken == 'undefined') {
      return this.logout();
    }
    try {
      const url = `${environment.api}/api/v1/auth/refresh-token`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong!');
      }
      const data = await response.json();
      return of(data);
    } catch {
      return of({ status: false });
    }
  }

  refreshObservable() {
    return from(this.refresh()).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  removeUser() {
    this.cookieService.delete(this.userKey);
  }

  logout() {
    this.removeUser();
    this.cookieService.delete('javapp-accessToken');
    this.cookieService.delete('javapp-refreshToken');
    window.localStorage.removeItem('javapp-accessToken');
    window.localStorage.removeItem('javapp-refreshToken');
    document.location.href = '/signin';
  }
}
