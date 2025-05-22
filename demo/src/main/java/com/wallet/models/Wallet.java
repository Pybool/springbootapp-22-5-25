package com.wallet.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

@Document("wallets")
public class Wallet {

    @Id
    private String id;

    @DBRef
    private Account account;
    
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal balance = BigDecimal.ZERO;
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal priorBalance = BigDecimal.ZERO;
    private String walletAccountNo;
    private String currency = "NGN";
    private String currencySymbol = "₦";
    private String currencyStorageUnitSymbol = "kobo";
    private String otp;
    private long otpExpiry;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt = LocalDateTime.now();

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

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getPriorBalance() {
        return priorBalance;
    }

    public void setPriorBalance(BigDecimal priorBalance) {
        this.priorBalance = priorBalance;
    }

    public String getWalletAccountNo() {
        return walletAccountNo;
    }

    public void setWalletAccountNo(String walletAccountNo) {
        this.walletAccountNo = walletAccountNo;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public void setCurrencySymbol(String currencySymbol) {
        this.currencySymbol = currencySymbol;
    }

    public String getCurrencyStorageUnitSymbol() {
        return currencyStorageUnitSymbol;
    }

    public void setCurrencyStorageUnitSymbol(String currencyStorageUnitSymbol) {
        this.currencyStorageUnitSymbol = currencyStorageUnitSymbol;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public long getOtpExpiry() {
        return otpExpiry;
    }

    public void setOtpExpiry(long otpExpiry) {
        this.otpExpiry = otpExpiry;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
