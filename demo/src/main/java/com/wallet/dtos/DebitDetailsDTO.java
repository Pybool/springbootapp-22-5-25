package com.wallet.dtos;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class DebitDetailsDTO {

    @NotBlank
    private String walletAccountNo;

    @NotBlank
    private String currency;

    @NotNull
    private BigDecimal amount = BigDecimal.ZERO;

    private String otp;

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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}

