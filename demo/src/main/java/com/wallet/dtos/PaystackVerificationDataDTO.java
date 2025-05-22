package com.wallet.dtos;

import java.math.BigDecimal;

public class PaystackVerificationDataDTO {
    private BigDecimal amount = BigDecimal.ZERO;
    private BigDecimal requestedAmount = BigDecimal.ZERO;
    private String currency;
    private String status;
    private String reference;
    private String channel;
    private BigDecimal fees = BigDecimal.ZERO;
    private PaystackCustomerDTO customer;
    private String paidAt;
    private String createdAt;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(BigDecimal requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public BigDecimal getFees() {
        return fees;
    }

    public void setFees(BigDecimal fees) {
        this.fees = fees;
    }

    public PaystackCustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(PaystackCustomerDTO customer) {
        this.customer = customer;
    }

    public String getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(String paidAt) {
        this.paidAt = paidAt;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
