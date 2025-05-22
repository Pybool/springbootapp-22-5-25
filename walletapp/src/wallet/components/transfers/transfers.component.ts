import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { AccountIdentificationComponent } from '../account-identification/account-identification.component';
import { IWallet } from '../../wallet.interfaces';
import { WalletService } from '../../../services/wallet/wallet.service';
import { take } from 'rxjs';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, AccountIdentificationComponent],
  templateUrl: './transfers.component.html',
  styleUrl: './transfers.component.scss',
})
export class TransfersComponent {
  @Input() wallet: IWallet = {};
  @Input() isVisible = false; // Control visibility from the parent component
  @Output() close = new EventEmitter<string>(); // Notify parent when closed
  public showAccountIdentification: boolean = false;
  public serverUrl: string = environment.api;
  public page: number = 1;
  public limit: number = 10;
  public filter: any = {};
  public searchBarText: string = '';
  public beneficiaries: any[] = []; // Array to hold the fetched listings
  public totalItems: number = 0; // Total items count for pagination
  public totalPages: number = 0; // Total pages for pagination
  public isLoading: boolean = false; // Flag to prevent multiple clicks
  public hasMore: boolean = true; // To track if there are more listings to load
  public withBeneficiaryData: any = null;

  constructor(
    private walletService: WalletService,
    public sharedService: SharedService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    // Check if newTransaction has changed and it's not null
    console.log(changes['isVisible']);
    if (this.isVisible) {
      this.loadBeneficiaries();
    }
  }

  loadBeneficiaries(searchOveride: boolean = false) {
    if (this.isLoading) return;
    this.isLoading = true;

    this.walletService
      .fetchBeneficiaries(this.page, this.limit, this.filter)
      .pipe(take(1))
      .subscribe(
        (response: any) => {
          if (response && response.data) {
            this.wallet = response.data.wallet;
            if (!searchOveride) {
              this.beneficiaries = [
                ...this.beneficiaries,
                ...response.data.beneficiaries,
              ];
            } else {
              this.beneficiaries = [...response.data.beneficiaries];
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
    this.loadBeneficiaries(); // Load next page of listings
  }

  toggleAccountIdentification(beneficiary: any = null) {
    this.showAccountIdentification = !this.showAccountIdentification;
    this.isVisible = false;
    if (beneficiary) {
      this.withBeneficiaryData = {
        receipientWallet: beneficiary,
      };
    }
  }

  handleBackEvent() {
    this.isVisible = true;
    this.showAccountIdentification = false;
  }

  closeModal(): void {
    this.isVisible = false;
    this.showAccountIdentification = false;
    this.close.emit('transfer');
  }
}
