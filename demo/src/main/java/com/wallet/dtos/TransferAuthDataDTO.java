package com.wallet.dtos;

import java.math.BigDecimal;

public class TransferAuthDataDTO {

    private DebitDetails debitDetails;
    private CreditDetails creditDetails;
    private BigDecimal sourceAmount = BigDecimal.ZERO;
    private String sourceCurrency;
    private String targetCurrency;
    private boolean saveBeneficiary;
    private String otp;

    public static class DebitDetails {
        private String walletAccountNo;

        public String getWalletAccountNo() {
            return walletAccountNo;
        }

        public void setWalletAccountNo(String walletAccountNo) {
            this.walletAccountNo = walletAccountNo;
        }
    }

    public static class CreditDetails {
        private String walletAccountNo;

        public String getWalletAccountNo() {
            return walletAccountNo;
        }

        public void setWalletAccountNo(String walletAccountNo) {
            this.walletAccountNo = walletAccountNo;
        }
    }

    public DebitDetails getDebitDetails() {
        return debitDetails;
    }

    public void setDebitDetails(DebitDetails debitDetails) {
        this.debitDetails = debitDetails;
    }

    public CreditDetails getCreditDetails() {
        return creditDetails;
    }

    public void setCreditDetails(CreditDetails creditDetails) {
        this.creditDetails = creditDetails;
    }

    public BigDecimal getSourceAmount() {
        return sourceAmount;
    }

    public void setSourceAmount(BigDecimal sourceAmount) {
        this.sourceAmount = sourceAmount;
    }

    public String getSourceCurrency() {
        return sourceCurrency;
    }

    public void setSourceCurrency(String sourceCurrency) {
        this.sourceCurrency = sourceCurrency;
    }

    public String getTargetCurrency() {
        return targetCurrency;
    }

    public void setTargetCurrency(String targetCurrency) {
        this.targetCurrency = targetCurrency;
    }

    public boolean isSaveBeneficiary() {
        return saveBeneficiary;
    }

    public void setSaveBeneficiary(boolean saveBeneficiary) {
        this.saveBeneficiary = saveBeneficiary;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
