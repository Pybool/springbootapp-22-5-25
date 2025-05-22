package com.wallet.dtos;

import java.math.BigDecimal;

import com.wallet.models.Account;

public class TransferIntentOtpDTO {
    private BigDecimal amount = BigDecimal.ZERO;
    private String walletToDebit;
    private String walletToCredit;
    private Account account;
    public BigDecimal getAmount() { return amount; }
    public String getWalletToDebit() { return walletToDebit; }
    public String getWalletToCredit() { return walletToCredit; }
    public void setSenderAccount(Account account) { this.account = account; }
    public Account getSenderAccount() { return account; }
}
