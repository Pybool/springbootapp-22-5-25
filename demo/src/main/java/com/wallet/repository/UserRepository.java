package com.wallet.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.wallet.models.Account;

public interface UserRepository extends MongoRepository<Account, String> {
    Optional<Account> findByEmail(String email);
}
