
package com.wallet.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.wallet.models.PaystackVerifiedTransaction;

public interface PaystackVerifiedTransactionRepository extends MongoRepository<PaystackVerifiedTransaction, String> {
    Optional<PaystackVerifiedTransaction> findByTxRef(String txRef);
}
