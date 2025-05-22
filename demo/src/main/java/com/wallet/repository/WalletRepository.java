package com.wallet.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.wallet.models.Wallet;

import java.util.Optional;

public interface WalletRepository extends MongoRepository<Wallet, String> {
    Optional<Wallet> findByWalletAccountNo(String walletAccountNo);

    Optional<Wallet> findByAccountId(String account);

}