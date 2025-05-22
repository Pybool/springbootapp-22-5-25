package com.wallet.dtos;

public class VerifyTransactionRequestDTO {
    private String ref;
    private String amount;
    private String currency;

    public String getRef() { return ref; }
    public void setRef(String ref) { this.ref = ref; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}
