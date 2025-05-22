package com.wallet.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.wallet.models.Wallet;
import com.wallet.models.WalletTransaction;

import java.util.Optional;

public interface WalletTransactionRepository extends MongoRepository<WalletTransaction, String> {
    Optional<Wallet> findByReference(String reference);
}