package com.wallet.dtos;

public class WalletTopUpDTO {
    private String txRef;
    private WalletDTO wallet;
    private PaystackVerificationDataDTO paystackData; 

    public String getTxRef() {
        return txRef;
    }

    public void setTxRef(String txRef) {
        this.txRef = txRef;
    }

    public WalletDTO getWallet() {
        return wallet;
    }

    public void setWallet(WalletDTO wallet) {
        this.wallet = wallet;
    }

    public PaystackVerificationDataDTO getData() {
        return paystackData;
    }

    public void setData(PaystackVerificationDataDTO paystackData) {
        this.paystackData = paystackData;
    }
}
