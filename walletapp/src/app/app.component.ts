import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthGuard } from '../services/auth-guard.service';

import { AuthService } from '../services/auth.service';
import { environment } from '../environments/environment';
import { WalletService } from '../services/wallet/wallet.service';
import { SocketService } from '../services/socket.service';
import { EventService } from '../services/event.service';
import { SharedService } from '../services/shared.service';
import { EmitterService } from '../services/dataEmitter.service';
import { PaystackService } from '../services/paystack.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    AuthGuard,
    EmitterService,
    AuthService,
    SharedService,
    WalletService,
    SocketService,
    EventService,
    PaystackService
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Javapp';
}
