import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from './token.service';
import { environment } from '../environments/environment'; // Import your environment

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refresh = false;

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.tokenService.retrieveToken('javapp-accessToken');
    let req = request;

    // Intercept only requests that start with environment.api
    if (request.url.startsWith(environment.api) && authToken) {
      req = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log('Intercept error', err.status);
        if (request.url.startsWith(environment.api)){
          if (err.status === 404 && err?.error?.message === 'No such user account was found') {
            this.tokenService.logout();
            document.location.href = '/signin';
          }
  
          // if (err.status === 400 && err?.error?.message === 'No access token provided') {
          //   this.tokenService.logout();
          //   document.location.href = '/signin';
          // }
  
          // if ((err.status === 401 || err.status === 403) && !this.refresh) {
          //   return this.tokenService.refreshObservable().pipe(
          //     switchMap((res: any) => {
          //       res.pipe(take(1)).subscribe((res: any) => {
          //         if (!res.status) {
          //           this.tokenService.logout();
          //         } else {
          //           this.tokenService.storeTokens(res);
          //           return next.handle(
          //             request.clone({
          //               setHeaders: {
          //                 Authorization: `Bearer ${this.tokenService.retrieveToken(
          //                   'javapp-accessToken'
          //                 )}`,
          //               },
          //             })
          //           );
          //         }
          //         return null;
          //       });
          //       return next.handle(
          //         request.clone({
          //           setHeaders: {
          //             Authorization: `Bearer ${this.tokenService.retrieveToken(
          //               'javapp-accessToken'
          //             )}`,
          //           },
          //         })
          //       );
          //     })
          //   );
          // }
        }
        

        this.refresh = false;
        return throwError(() => err);
      })
    );
  }
}
