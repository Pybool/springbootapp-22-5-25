import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaystackService {
  private sharedData: any;
  constructor(private http: HttpClient) {}

  private paystackPublicKey = environment.PAYSTACK_PUBLIC_KEY;

  public initiatePayment(
    amount: number,
    email: string,
    callback: (response: any) => void
  ) {
    // Call Paystack inline method to initiate payment
    console.log("Amount ", amount, Math.ceil(amount))
    const handler = (window as any).PaystackPop.setup({
      key: this.paystackPublicKey,
      email,
      amount: Math.ceil(amount) * 100, // Paystack expects amount in kobo (smallest currency unit)
      callback,
      currency: 'NGN',
      channels: ['card'],
      channel_options: {},
    });

    // Open Paystack payment dialog
    handler.openIframe();
  }

  public verifyTransaction(
    reference: string,
    amount:number,
    currency:string
  ) {
    return this.http
      .post(
        `${environment.api}/paystack/verify-transaction`,{
            ref:reference,
            amount:amount,
            currency:currency
        }
      )
  }
}
