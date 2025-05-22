package com.wallet.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.wallet.models.Account;
import com.wallet.models.WalletBeneficiary;

public interface BeneficiaryRepository extends MongoRepository<WalletBeneficiary, String> {
    Page<WalletBeneficiary> findByAccountId(String accountId, Pageable pageable);
    boolean existsByAccountIdAndBeneficiaryAccountId(Account accountId, Account beneficiaryAccountId);
}
