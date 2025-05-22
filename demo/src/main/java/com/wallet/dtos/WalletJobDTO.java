package com.wallet.dtos;

import java.math.BigDecimal;
import com.wallet.models.enums.WalletOperationType;
import com.wallet.models.enums.WalletTransactionType;

public class WalletJobDTO {
    private WalletTransactionType walletJobType;
    private String walletAccountNo;
    private BigDecimal amount = BigDecimal.ZERO;
    private WalletOperationType operationType;
    private String verifiedTransactionId;

    private DebitDetailsDTO debitDetails;
    private CreditDetailsDTO creditDetails;
    private boolean saveBeneficiary;
    private String accountId;

    public WalletJobDTO() {
    }

    public WalletTransactionType getWalletJobType() {
        return walletJobType;
    }

    public void setWalletJobType(WalletTransactionType walletJobType) {
        this.walletJobType = walletJobType;
    }

    public String getWalletAccountNo() {
        return walletAccountNo;
    }

    public void setWalletAccountNo(String walletAccountNo) {
        this.walletAccountNo = walletAccountNo;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public WalletOperationType getOperationType() {
        return operationType;
    }

    public void setOperationType(WalletOperationType operationType) {
        this.operationType = operationType;
    }

    public String getVerifiedTransactionId() {
        return verifiedTransactionId;
    }

    public void setVerifiedTransactionId(String verifiedTransactionId) {
        this.verifiedTransactionId = verifiedTransactionId;
    }

    public DebitDetailsDTO getDebitDetails() {
        return debitDetails;
    }

    public void setDebitDetails(DebitDetailsDTO debitDetails) {
        this.debitDetails = debitDetails;
    }

    public CreditDetailsDTO getCreditDetails() {
        return creditDetails;
    }

    public void setCreditDetails(CreditDetailsDTO creditDetails) {
        this.creditDetails = creditDetails;
    }


    public boolean isSaveBeneficiary() {
        return saveBeneficiary;
    }

    public void setSaveBeneficiary(boolean saveBeneficiary) {
        this.saveBeneficiary = saveBeneficiary;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

}
