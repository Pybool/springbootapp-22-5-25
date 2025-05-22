package com.wallet.responses;

import java.util.List;

import com.wallet.models.Wallet;
import com.wallet.models.WalletTransaction;

public class WalletTransactionResponse {
    private Wallet wallet;
    private List<WalletTransaction> transactions;
    private Pagination pagination;

    public WalletTransactionResponse(Wallet wallet, List<WalletTransaction> transactions, Pagination pagination) {
        this.wallet = wallet;
        this.transactions = transactions;
        this.pagination = pagination;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public List<WalletTransaction> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<WalletTransaction> transactions) {
        this.transactions = transactions;
    }

    public Pagination getPagination() {
        return pagination;
    }

    public void setPagination(Pagination pagination) {
        this.pagination = pagination;
    }
}
