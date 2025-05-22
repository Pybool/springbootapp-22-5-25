package com.wallet.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import com.wallet.dtos.CreditDetailsDTO;
import com.wallet.dtos.WalletJobDTO;
import com.wallet.models.Wallet;
import com.wallet.models.WalletBeneficiary;
import com.wallet.models.WalletTransaction;
import com.wallet.models.enums.WalletOperationType;
import com.wallet.models.enums.WalletTransactionType;
import com.wallet.repository.BeneficiaryRepository;
import com.wallet.repository.WalletRepository;
import com.wallet.repository.WalletTransactionRepository;
import com.wallet.utils.Helpers;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class WalletOperations {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private BeneficiaryRepository beneficiaryRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void DirectWalletTopUp(
            WalletTransactionType jobType, BigDecimal amount,
            WalletOperationType operationType,
            CreditDetailsDTO creditDetails) throws Exception {

        log.info(amount.toString());

        String reference = Helpers.generateReferenceCode("WDT-");
        BigDecimal positiveAmount = amount.abs();
        BigDecimal incAmount = operationType == WalletOperationType.CREDIT
                ? positiveAmount
                : positiveAmount.negate();

        Wallet existingWallet = mongoTemplate.findOne(
                Query.query(Criteria.where("walletAccountNo").is(creditDetails.getWalletAccountNo())),
                Wallet.class);

        if (existingWallet == null) {
            throw new IllegalArgumentException("Wallet not found for account: " + creditDetails.getWalletAccountNo());
        }

        Update update = new Update()
                .set("priorBalance", existingWallet.getBalance())
                .inc("balance", incAmount);

        log.info("Current wallet balance (type={}): {}", existingWallet.getBalance().getClass(), existingWallet.getBalance(), incAmount);


        Query query = new Query(Criteria.where("walletAccountNo").is(creditDetails.getWalletAccountNo()));

        Wallet updatedWallet = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Wallet.class);

        if (updatedWallet == null) {
            throw new Exception("Wallet update failed");
        }

        WalletTransaction transaction = new WalletTransaction();
        transaction.setWallet(updatedWallet);
        transaction.setAccount(updatedWallet.getAccount());
        transaction.setAmount(positiveAmount);
        transaction.setPriorBalance(existingWallet.getBalance());
        transaction.setType(jobType);
        transaction.setOperationType(operationType);
        transaction.setReference(reference);
        transaction.setCreatedAt(LocalDateTime.now());

        WalletTransaction savedTransaction = walletTransactionRepository.save(transaction);

        notificationService.createNotification("Direct Topup Credit on Wallet", updatedWallet, savedTransaction);
        log.info("✅ Wallet direct topup operation completed successfully.");
    }

    @Transactional(rollbackFor = Exception.class, propagation = Propagation.REQUIRED)
    public void WalletTransfer(WalletJobDTO jobData) throws Exception {

        WalletTransactionType type = jobData.getWalletJobType();
        BigDecimal amount = jobData.getAmount().multiply(BigDecimal.valueOf(100)); 
        var debitDetails = jobData.getDebitDetails();
        var creditDetails = jobData.getCreditDetails();
        boolean saveBeneficiary = jobData.isSaveBeneficiary();

        String senderWalletAccountNo = debitDetails.getWalletAccountNo();
        String receiverWalletAccountNo = creditDetails.getWalletAccountNo();
        String senderCurrency = debitDetails.getCurrency();
        String otp = debitDetails.getOtp();

        Wallet senderWallet = ValidateTransfer(
                senderWalletAccountNo,
                receiverWalletAccountNo,
                senderCurrency,
                amount,
                otp);

        String reference = Helpers.generateReferenceCode("TRN-");

        BigDecimal balance = senderWallet.getBalance();
        BigDecimal deduction = amount;
        
        if (balance == null) {
            throw new IllegalStateException("Sender wallet balance is null");
        }
        
        if (deduction == null) {
            throw new IllegalArgumentException("Amount to subtract is null");
        }
        
        senderWallet.setBalance(balance.subtract(deduction));
        
        senderWallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(senderWallet);

        WalletTransaction senderTransaction = new WalletTransaction();
        senderTransaction.setAccount(senderWallet.getAccount());
        senderTransaction.setDebitWalletAccountNo(senderWalletAccountNo);
        senderTransaction.setCreditWalletAccountNo(receiverWalletAccountNo);
        senderTransaction.setAmount(amount);
        senderTransaction.setPriorBalance(balance);
        senderTransaction.setType(type);
        senderTransaction.setOperationType(WalletOperationType.DEBIT);
        senderTransaction.setReference(reference);
        senderTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepository.save(senderTransaction);

        notificationService.createNotification("Outgoing Transfer on Wallet", senderWallet, senderTransaction);

        Wallet receiverWallet = walletRepository
                .findByWalletAccountNo(receiverWalletAccountNo)
                .orElseThrow(() -> new RuntimeException("Receiver wallet not found"));

        BigDecimal rbalance = receiverWallet.getBalance();
        BigDecimal addition = amount;
        
        if (rbalance == null) {
            throw new IllegalStateException("Sender wallet balance is null");
        }
        
        if (addition == null) {
            throw new IllegalArgumentException("Amount to add is null");
        }
        receiverWallet.setBalance(balance.add(addition));
        // receiverWallet.setBalance(receiverWallet.getBalance().add(amount));
        walletRepository.save(receiverWallet);

        WalletTransaction receiverTransaction = new WalletTransaction();
        receiverTransaction.setAccount(receiverWallet.getAccount());
        receiverTransaction.setDebitWalletAccountNo(senderWalletAccountNo);
        receiverTransaction.setCreditWalletAccountNo(receiverWalletAccountNo);
        receiverTransaction.setAmount(amount);
        receiverTransaction.setPriorBalance(rbalance);
        receiverTransaction.setType(type);
        receiverTransaction.setOperationType(WalletOperationType.CREDIT);
        receiverTransaction.setReference(reference);
        receiverTransaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepository.save(receiverTransaction);

        notificationService.createNotification("Incoming Transfer on Wallet", receiverWallet, receiverTransaction);
        if (saveBeneficiary) {
            boolean exists = beneficiaryRepository.existsByAccountIdAndBeneficiaryAccountId(
                    senderWallet.getAccount(), receiverWallet.getAccount());

            if (!exists) {
                WalletBeneficiary beneficiary = new WalletBeneficiary();
                beneficiary.setAccount(senderWallet.getAccount());
                beneficiary.setBeneficiaryAccount(receiverWallet.getAccount());
                beneficiary.setReceiverWallet(receiverWallet);
                beneficiaryRepository.save(beneficiary);
            }
        }

        log.info("✅ Wallet transfer operation completed successfully.");
    }

    private Wallet ValidateTransfer(
            String senderWalletAccountNo,
            String receiverWalletAccountNo,
            String currency,
            BigDecimal amount,
            String otp) {
        Wallet senderWallet = walletRepository
                .findByWalletAccountNo(senderWalletAccountNo)
                .orElseThrow(() -> new RuntimeException("Sender has no wallet"));

        walletRepository
                .findByWalletAccountNo(receiverWalletAccountNo)
                .orElseThrow(() -> new RuntimeException("Receiver has no wallet"));

        if (!senderWallet.getCurrency().equalsIgnoreCase(currency)) {
            throw new RuntimeException("Invalid currency for sender's wallet");
        }

        if (senderWallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance in sender's wallet");
        }

        return senderWallet;
    }
}
