import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges, OnDestroy } from '@angular/core';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SharedService } from '../services/shared.service';
import { AuthService } from '../services/auth.service';
import { WalletService } from '../services/wallet/wallet.service';
import { environment } from '../environments/environment';
import { debounceTime, Subject, Subscription, take } from 'rxjs';
import { TransfersComponent } from './components/transfers/transfers.component';
import { AddReceiveMoneyComponent } from './components/add-receive-money/add-receive-money.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';
import { IWallet } from './wallet.interfaces';
import { SnackBarService } from '../services/snackbar.service';
import { WithdrawalComponent } from './components/withdrawal/withdrawal.component';
import { EventService } from '../services/event.service';
import { Router } from '@angular/router';
import { Ivirtualcard } from './components/virtual-card/virtual-card.interface';
import { VirtualCardComponent } from './components/virtual-card/virtual-card.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { SocketService } from '../services/socket.service';
import { RxEventBus } from '../services/event-bus';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
    TransfersComponent,
    AddReceiveMoneyComponent,
    TransactionHistoryComponent,
    WithdrawalComponent,
    LoadingSpinnerComponent,
    VirtualCardComponent,
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
})
export class WalletComponent implements OnDestroy {
  public user: any = null;
  public canShow: boolean = true;
  public cardsLoaded: boolean = false;
  public showSpinner: boolean = false;
  public transferIsVisible: boolean = false;
  public addMoneyIsVisible: boolean = false;
  public withdrawMoneyIsVisible: boolean = false;
  public transactionHistoryIsVisible: boolean = false;
  private eventSubscription!: Subscription;
  public page: number = 1;
  public limit: number = 5;
  public filter: any = {};
  public searchBarText: string = '';
  public serverUrl: string = environment.api;

  public transactions: any[] = []; // Array to hold the fetched listings
  public totalItems: number = 0; // Total items count for pagination
  public totalPages: number = 0; // Total pages for pagination
  public isLoading: boolean = false; // Flag to prevent multiple clicks
  public hasMore: boolean = true; // To track if there are more listings to load

  public hideBalance: boolean = true;
  public wallet: IWallet = {};

  @Input() newTransaction: any = null;
  private debounceSubject: Subject<string> = new Subject();
  public transactionsClone: any[] = [];
  public Object = Object;
  private subscription!: Subscription;
  eventData: any;
  public sampleVirtualCard: Ivirtualcard = {
    logo: '/assets/_images/flutterwave-logo.png',
    toprightImg: '/assets/images/alchemypay.png',
    rearImg: '',
    bin: 'xxxxxxxxxxxxxxxx',
    name: '',
    expiration: '10 / 25',
  };

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private authService: AuthService,
    private walletService: WalletService,
    private snackBarService: SnackBarService,
    private eventService: EventService,
    private socketService: SocketService
  ) {
    this.debounceSubject
      .pipe(debounceTime(500))
      .subscribe((searchText: string) => {
        // Call the filter method after debounce
        this.filter = { searchText: searchText };
        this.page = 1;
        this.totalItems = 0;
        this.totalPages = 0;
        this.transactionsClone = JSON.parse(JSON.stringify(this.transactions));
        this.loadTransactions(true);
      });
  }

  ngOnInit() {
    this.user = this.authService.retrieveUser();
    this.socketService.connectToSocket();
    this.sampleVirtualCard.name = `${this.user?.firstname || 'John'} ${
      this.user?.lastname || 'Doe'
    }`.toLocaleUpperCase();
    this.loadTransactions();
    this.eventListeners();
    this.subscription = this.sharedService.terminate$.subscribe((val) => {
      console.log('Terminating modals ==> ', val);
      this.cleanup();
    });
  }

  handleBackEvent($event: any) {
    if ($event === 'transfer') {
      this.transferIsVisible = false;
    } else if ($event === 'receive-money') {
      this.addMoneyIsVisible = false;
    } else if ($event === 'withdrawal') {
      this.withdrawMoneyIsVisible = false;
    }
  }

  toggleTransferModal() {
    this.canShow = true;
    this.transferIsVisible = !this.transferIsVisible;
    
  }

  toggleAddMoneyOrReceiveModal() {
    this.canShow = true;
    this.addMoneyIsVisible = !this.addMoneyIsVisible;
  }

  toggleWithdrawMoneyModal() {
    this.canShow = true;
    try {
      this.validateBankWithdrawalDetails();
      this.withdrawMoneyIsVisible = !this.withdrawMoneyIsVisible;
    } catch (error: any) {
      console.log(error);
      const status = error?.message;
      if (status) {
        if (status.includes('Invalid value for field')) {
          this.snackBarService.showWithIcon(
            `${status.replaceAll(
              '_',
              ' '
            )}, please ensure your profile banking details, currency and personal details are correctly filled.`
          );
        } else if (status.includes('Invalid or unsupported region')) {
          this.snackBarService.showWithIcon(status);
        }
      }
    }
  }

  toggleTransactionHistoryModal() {
    this.canShow = true;
    this.transactionHistoryIsVisible = !this.transactionHistoryIsVisible;
  }

  toggleBalanceVisibility() {
    this.hideBalance = !this.hideBalance;
  }

  formatTimestamp(timestamp: string): string {
    // Create a Date object from the given timestamp
    const date = new Date(timestamp);

    // Define the formatting options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // To use 12-hour format with AM/PM
    };

    // Create a formatter with the given options
    const formatter = new Intl.DateTimeFormat('en-US', options);

    // Format and return the date
    return formatter.format(date);
  }

  cleanup() {
    this.transferIsVisible = false;
    this.addMoneyIsVisible = false;
    this.withdrawMoneyIsVisible = false;
    this.transactionHistoryIsVisible = false;
    this.canShow = false;
  }

  copyTextToClipBoard(text: string): void {
    // Copy the wallet address to the clipboard
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.snackBarService.showWithIcon('Wallet ID copied to clipboard');
        setTimeout(() => {
          this.snackBarService.hide();
        }, 2000);
      })
      .catch((error) => {
        // If an error occurs while copying, show an error message
        this.snackBarService.showWithIcon('Failed to copy Wallet ID');
        console.error('Error copying to clipboard: ', error);
      });
  }

  validateBankWithdrawalDetails() {
    const isValid = (value: any) =>
      value !== null && value !== undefined && value !== '';
    const validateFields = (fields: { name: string; value: any }[]) => {
      for (const field of fields) {
        if (!isValid(field.value)) {
          throw new Error(`Invalid value for field: "${field.name}"`);
        }
      }
    };

    if (this.user?.geoData?.code === 'NG') {
      validateFields([
        { name: 'account_bank', value: this.user.bankInfo?.bank?.code },
        { name: 'account_number', value: this.user?.bankInfo?.accountNumber },
        { name: 'currency', value: this.user?.geoData?.currency?.code },
      ]);
    } else if (this.user?.geoData?.code === 'GH') {
      validateFields([
        { name: 'account_bank', value: this.user.bankInfo?.bank?.code },
        { name: 'account_number', value: this.user?.bankInfo?.accountNumber },
        { name: 'currency', value: this.user?.geoData?.currency?.code },
        {
          name: 'destination_branch_code',
          value: this.user?.bankInfo?.branch?.branch_code,
        },
        { name: 'beneficiary_name', value: this.user?.bankInfo?.accountName },
      ]);
    } else if (this.user?.geoData?.code === 'ZA') {
      validateFields([
        { name: 'account_bank', value: this.user.bankInfo?.bank?.code },
        { name: 'account_number', value: this.user?.bankInfo?.accountNumber },
        { name: 'currency', value: this.user?.geoData?.currency?.code },
        { name: 'beneficiary_name', value: this.user?.bankInfo?.accountName },
        { name: 'first_name', value: this.user?.firstname },
        { name: 'last_name', value: this.user?.lastname },
        { name: 'email', value: this.user?.email },
        { name: 'mobile_number', value: this.user?.phone },
        { name: 'recipient_address', value: this.user.geoData?.capital },
      ]);
    } else if (this.user.geoData.region === 'EU') {
      validateFields([
        { name: 'currency', value: this.user?.geoData?.currency?.code },
        { name: 'beneficiary_name', value: this.user?.bankInfo?.accountName },
        { name: 'account_number', value: this.user?.bankInfo?.accountNumber },
        {
          name: 'routing_number',
          value:
            this.user?.bankInfo?.swiftCode ||
            this.user?.bankInfo?.routingNumber,
        },
        { name: 'swift_code', value: this.user?.bankInfo?.swiftCode },
        { name: 'bank_name', value: this.user.bankInfo?.bank?.name },
        { name: 'beneficiary_country', value: this.user?.geoData?.code },
        { name: 'first_name', value: this.user?.firstname },
        { name: 'last_name', value: this.user?.lastname },
        { name: 'city', value: this.user?.geoData?.capital },
      ]);
    } else if (this.user?.geoData?.code === 'US') {
      validateFields([
        { name: 'currency', value: this.user?.geoData?.currency?.code },
        { name: 'beneficiary_name', value: this.user?.bankInfo?.accountName },
        { name: 'account_number', value: this.user?.bankInfo?.accountNumber },
        { name: 'routing_number', value: this.user?.bankInfo?.routingNumber },
        { name: 'swift_code', value: this.user?.bankInfo?.swiftCode },
        { name: 'bank_name', value: this.user.bankInfo?.bank?.name },
        { name: 'beneficiary_country', value: this.user?.geoData?.code },
      ]);
    } else if (this.user?.geoData?.code === 'CA') {
      validateFields([
        { name: 'currency', value: this.user?.geoData?.currency?.code },
        { name: 'beneficiary_name', value: this.user?.bankInfo?.accountName },
        { name: 'account_number', value: this.user?.bankInfo?.accountNumber },
        // { name: 'routing_number', value: this.user?.bankInfo?.routingNumber },
        // { name: 'swift_code', value: this.user?.bankInfo?.swiftCode },
        { name: 'bank_name', value: this.user.bankInfo?.bank?.name },
        { name: 'beneficiary_country', value: this.user?.geoData?.code },
      ]);
    } else {
      throw new Error('Invalid or unsupported region code.');
    }
  }

  // Detect changes to @Input() newListing
  ngOnChanges(changes: SimpleChanges): void {
    // Check if newTransaction has changed and it's not null
    if (changes['newTransaction'] && this.newTransaction !== null) {
      // Prepend newTransaction to listings array using unshift
      this.transactions.unshift(this.newTransaction);
    }
  }

  // Method to load the listings for the current page
  loadTransactions(searchOveride: boolean = false) {
    if (this.isLoading) return;
    this.isLoading = true;

    this.walletService
      .fetchTransactionsAndWallet(this.page, this.limit, this.filter)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response && response.data) {
            this.wallet = response.data.wallet;
            if (!this.wallet) {
              this.walletService
                .createWallet()
                .pipe(take(1))
                .subscribe(
                  (response: any) => {
                    this.snackBarService.showWithIcon(response?.message);
                    if (response.status) {
                      document.location.reload();
                    }
                  },
                  (error: any) => {
                    this.snackBarService.show(error?.error?.message, true);
                  }
                );
            }
            if (!searchOveride) {
              this.transactions = [
                ...this.transactions,
                ...response.data.transactions,
              ];
            } else {
              this.transactions = [...response.data.transactions];
            }
            // Append new listings
            this.totalItems = response.data.pagination.totalDocuments;
            this.totalPages = response.data.pagination.totalPages;

            // Update pagination state
            this.page++; // Increment page for the next fetch
            this.isLoading = false; // Reset loading state

            if (this.page > this.totalPages) {
              this.hasMore = false; // No more listings to load
            }
          }
        },
        () => {
          this.isLoading = false; // Reset loading state on error
        }
      );
  }

  eventListeners() {
    this.eventSubscription = RxEventBus.subscribe(
      (event: { type: string; payload: any }) => {
        console.log('🔔 Notification:', event);

        switch (event.type) {
          case 'NOTIFICATION':
            if (event.payload.walletTransaction) {
              this.eventData = event.payload.walletTransaction; // Process the event data as needed
              const arr = this.eventData.createdAt;
              // JavaScript Date uses milliseconds, so convert nanoseconds to milliseconds
              const ms = Math.floor(arr[6] / 1_000_000);

              // Month in JS is 0-based, subtract 1 from `arr[1]`
              const date = new Date(
                Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5], ms)
              );

              // Format to ISO 8601 string with offset +00:00
              this.eventData.createdAt = date
                .toISOString()
                .replace('Z', '+00:00');
              console.log(this.eventData)
              this.transactions.unshift(this.eventData);
              this.subscription = this.sharedService.terminate$.subscribe((val) => {
                console.log('Terminating modals ==> ', val);
                this.cleanup();
              });
            }

            if (event.payload?.wallet) {
              this.wallet = event.payload.wallet;
              // this.eventService.emitEvent({updateWalletBalance: true, wallet:data.wallet});
            }
            // handle notification
            break;

          default:
            console.warn('⚠️ Unknown event type:', event.payload.type);
            break;
        }
      }
    );
  }

  onLoadMore() {
    this.loadTransactions(); // Load next page of listings
  }

  ngOnDestroy() {
    this.eventSubscription?.unsubscribe();
    this.subscription?.unsubscribe();
  }
}
