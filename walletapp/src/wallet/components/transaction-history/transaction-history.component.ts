import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnDestroy
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { debounceTime, Subject, Subscription, take } from 'rxjs';
import { SharedService } from '../../../services/shared.service';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service';
import { WalletService } from '../../../services/wallet/wallet.service';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.scss',
})
export class TransactionHistoryComponent implements OnDestroy{
  @Input() isVisible = false; // Control visibility from the parent component
  @Output() close = new EventEmitter<void>(); // Notify parent when closed
  public showAccountIdentification: boolean = false;
  public serverUrl: string = environment.api;

  public user: any = null;
  public cardsLoaded: boolean = false;
  public showSpinner: boolean = false;
  public transferIsVisible: boolean = false;
  public addMoneyIsVisible: boolean = false;

  public page: number = 1;
  public limit: number = 10;
  public filter: any = {};
  public searchBarText: string = '';

  public transactions: any[] = []; // Array to hold the fetched listings
  public totalItems: number = 0; // Total items count for pagination
  public totalPages: number = 0; // Total pages for pagination
  public isLoading: boolean = false; // Flag to prevent multiple clicks
  public hasMore: boolean = true; // To track if there are more listings to load

  @Input() newTransaction: any = null;
  private debounceSubject: Subject<string> = new Subject();
  private eventSubscription: Subscription | any;
  eventData: any;
  public transactionsClone: any[] = [];
  public Object = Object;

  constructor(
    private sharedService: SharedService,
    private authService: AuthService,
    private walletService: WalletService,
    private eventService: EventService
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
    this.sharedService.setPageTitle('Wallet');
    this.user = this.authService.retrieveUser();
    this.loadTransactions();
    this.eventSubscription = this.eventService.events$.subscribe((data) => {
      console.log('Event received:', data); //ERROR RangeError: Maximum call stack size exceeded
      this.eventData = data; // Process the event data as needed
      this.transactions.unshift(data)
    });
  }

  toggleTransferModal() {
    this.transferIsVisible = !this.transferIsVisible;
  }

  toggleAddMoneyOrReceiveModal() {
    this.addMoneyIsVisible = !this.addMoneyIsVisible;
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

  onLoadMore() {
    this.loadTransactions(); // Load next page of listings
  }

  toggleAccountIdentification() {
    this.showAccountIdentification = !this.showAccountIdentification;
  }

  closeModal(): void {
    this.isVisible = false;
    this.close.emit();
  }

  ngOnDestroy(){
    this.eventSubscription?.unsubscribe()
  }
}
