import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { GLOBAL_HTTP_PROVIDERS } from '../global-providers';
import { AuthGuard, NoAuthGuard } from '../services/auth-guard.service';
import { HttpClient } from '@angular/common/http';


export const appConfig: ApplicationConfig = {
  providers: [
    HttpClient,
    AuthGuard,
    NoAuthGuard,
    provideRouter(routes),
    ...GLOBAL_HTTP_PROVIDERS
  ],
};
