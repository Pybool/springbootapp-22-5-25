import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {

  private timeoutSeconds = environment.HTTP_TIMEOUT * 10000//10000 for 1 minute

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      timeout(this.timeoutSeconds),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          return throwError('Request timed out');
        }
        return throwError(error);
      })
    );
  }
}
