package com.wallet.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.wallet.dtos.PaystackVerificationDataDTO;

import java.time.LocalDateTime;

@Document(collection = "paystack_verified_transactions")
public class PaystackVerifiedTransaction {

    @Id
    private String id;

    private String txRef;

    private PaystackVerificationDataDTO data;

    private LocalDateTime createdAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTxRef() {
        return txRef;
    }

    public void setTxRef(String txRef) {
        this.txRef = txRef;
    }

    public PaystackVerificationDataDTO getData() {
        return data;
    }

    public void setData(PaystackVerificationDataDTO data) {
        this.data = data;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
