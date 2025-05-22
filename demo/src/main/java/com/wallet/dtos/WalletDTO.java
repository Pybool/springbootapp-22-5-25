
package com.wallet.dtos;

import java.math.BigDecimal;

public class WalletDTO {
    private String buyerId;
    private String sellerId;
    private BigDecimal amount = BigDecimal.ZERO;

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}

