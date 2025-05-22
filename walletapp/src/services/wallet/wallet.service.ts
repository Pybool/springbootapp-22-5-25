import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import * as CryptoJS from 'crypto-js';
import { IWallet } from '../../wallet/wallet.interfaces';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  constructor(private http: HttpClient, private router: Router) {}

  public hashWithdrawalPayload(payload: any) {
    // Convert the payload to a string
    const payloadString = JSON.stringify(payload);

    // Hash the string using SHA-256
    const hashedPayload = CryptoJS.SHA256(payloadString).toString(
      CryptoJS.enc.Hex
    );

    console.log('Hashed Payload:', hashedPayload);
    return hashedPayload;
  }

  public hashWalletPaymentPayload(payload: any) {
    // Convert the payload to a string
    const payloadString = JSON.stringify(payload);

    // Hash the string using SHA-256
    const hashedPayload = CryptoJS.SHA256(payloadString).toString(
      CryptoJS.enc.Hex
    );

    console.log('Hashed Payload:', hashedPayload);
    return hashedPayload;
  }

  fetchTransactionsAndWallet(
    page: number = 1,
    limit: number = 20,
    filter: any = {}
  ) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        params = params.set(key, filter[key].toString());
      }
    });

    return this.http.get(
      `${environment.api}/wallet/fetch-wallet-transactions`,
      {
        params,
      }
    );
  }

  getReceipientWalletDetails(walletId: string) {
    return this.http.get(
      `${environment.api}/wallet/get-receipient-wallet-details?walletId=${walletId}`
    );
  }

  getReceipientWalletDetailsByUid(accountId: string) {
    return this.http.get(
      `${environment.api}/wallet/get-receipient-wallet-details-uid?accountId=${accountId}`
    );
  }

  fetchBeneficiaries(page: number = 1, limit: number = 20, filter: any = {}) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filter).forEach((key) => {
      if (filter[key]) {
        params = params.set(key, filter[key].toString());
      }
    });

    return this.http.get(
      `${environment.api}/wallet/fetch-beneficiaries`,
      {
        params,
      }
    );
  }

  sendTransferOtp(transferIntentPayload: {
    walletToDebit: string;
    walletToCredit: string;
    amount: number;
  }) {
    return this.http.post(
      `${environment.api}/wallet/send-transfer-otp`,
      transferIntentPayload
    );
  }

  sendWithdrawalOtp(payloadHash: string) {
    return this.http.post(
      `${environment.api}/wallet/send-withdrawal-otp`,
      { payloadHash }
    );
  }

  verifyWithdrawalOtp(withdrawalIntentPayload: {
    payloadHash: string;
    otp: string;
  }) {
    return this.http.post(
      `${environment.api}/api/v1/wallet/verify-withdrawal-otp`,
      withdrawalIntentPayload
    );
  }

  transferMoney(payload: any) {
    return this.http.post(
      `${environment.api}/wallet/transfer-to-wallet`,
      payload
    );
  }

  createWithdrawalRequest(payload: any) {
    return this.http.post(
      `${environment.api}/api/v1/wallet/create-withdrawal-request`,
      payload
    );
  }

  createWallet() {
    return this.http.post(`${environment.api}/api/v1/wallet/create-wallet`, {});
  }

  cardTopUpVendFundToWallet(payload: { tx_ref: string; wallet: IWallet }) {
    return this.http.post(
      `${environment.api}/api/v1/wallet/card-topup-fund-wallet`,
      payload
    );
  }

  sendWalletPaymentAuthorizationPin(payloadHash: string, checkOutId: string) {
    return this.http.post(
      `${environment.api}/api/v1/wallet/send-wallet-pay-authorization-pin`,
      { payloadHash, checkOutId }
    );
  }

  payWithWallet(payload: {
    amount: number;
    authorizationPin: number | string;
    orderId: string;
    paymentHash: string;
  }) {
    return this.http.post(
      `${environment.api}/api/v1/wallet/pay-with-wallet-balance`,
      payload
    );
  }
}
