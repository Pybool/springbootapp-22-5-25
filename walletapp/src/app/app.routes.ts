import { Routes } from '@angular/router';
import { WalletComponent } from '../wallet/wallet.component';
import { LoginComponent } from '../authentication/login/login.component';
import { RegisterComponent } from '../authentication/register/register.component';
import { TwoFaAuthVerificationComponent } from '../authentication/two-fa-auth-verification/two-fa-auth-verification.component';
import { LoginTwoFaAuthVerificationComponent } from '../authentication/login-two-fa-auth-verification/two-fa-auth-verification.component';

export const routes: Routes = [
    { path: 'signup', component: RegisterComponent},
    { path: 'signin', component: LoginComponent},
    { path: 'signup-verify-account', component: TwoFaAuthVerificationComponent},
    { path: 'signin-verify-account', component: LoginTwoFaAuthVerificationComponent},
    { path: 'wallet', component: WalletComponent}
];
