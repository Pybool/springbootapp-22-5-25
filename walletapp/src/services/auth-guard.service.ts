import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { TokenService } from './token.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public tokenService: TokenService, public router: Router) {}
  canActivate(): boolean {
    if (!this.tokenService.retrieveToken('javapp-accessToken')) {
      // this.router.navigateByUrl('/signin');
      document.location.href = '/signin';
      return false; //change back to false
    }
    return true;
  }
}

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(public tokenService: TokenService, public router: Router) {}
  canActivate(): boolean {
    if (!this.tokenService.retrieveToken('javapp-accessToken')) {
      return true;
    }
    document.location.href = '/signin';
    return false;
  }
}


@Injectable()
export class AuthGuardWithRedirect implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.retrieveUser();
    if (user) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.router.navigate(['/signin']);
    }
    return false; // Prevents loading the wildcard route
  }
}

