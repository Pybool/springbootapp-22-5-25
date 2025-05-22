package com.wallet.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.wallet.models.enums.WalletOperationType;
import com.wallet.models.enums.WalletTransactionType;
import org.springframework.data.mongodb.core.mapping.DBRef;

@Document(collection = "wallet_transactions")
public class WalletTransaction {

    @Id
    private String id;

    @DBRef
    private Account account;
    @DBRef
    private Wallet wallet;
    private String creditWalletAccountNo;
    private String debitWalletAccountNo;
    private BigDecimal amount = BigDecimal.ZERO;
    private BigDecimal priorBalance = BigDecimal.ZERO;

    private WalletTransactionType type = WalletTransactionType.WALLET_TRANSFER;
    private String reference;
    private WalletOperationType operationType = WalletOperationType.CREDIT;
    private LocalDateTime createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public String getCreditWalletAccountNo() {
        return creditWalletAccountNo;
    }

    public void setCreditWalletAccountNo(String creditWalletAccountNo) {
        this.creditWalletAccountNo = creditWalletAccountNo;
    }

    public String getDebitWalletAccountNo() {
        return debitWalletAccountNo;
    }

    public void setDebitWalletAccountNo(String debitWalletAccountNo) {
        this.debitWalletAccountNo = debitWalletAccountNo;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getPriorBalance() {
        return priorBalance;
    }

    public void setPriorBalance(BigDecimal priorBalance) {
        this.priorBalance = priorBalance;
    }

    public WalletTransactionType getType() {
        return type;
    }

    public void setType(WalletTransactionType type) {
        this.type = type;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public WalletOperationType getOperationType() {
        return operationType;
    }

    public void setOperationType(WalletOperationType operationType) {
        this.operationType = operationType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
