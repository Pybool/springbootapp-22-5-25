import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.inteceptor';

export const GLOBAL_HTTP_PROVIDERS = [
  // { provide: HTTP_INTERCEPTORS, useClass: SlowConnectionInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  // { provide: LocationStrategy, useClass: HashLocationStrategy }
];


