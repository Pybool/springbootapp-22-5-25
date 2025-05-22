package com.wallet.services;

import org.springframework.stereotype.Service;

import com.wallet.dtos.CreditDetailsDTO;
import com.wallet.dtos.DebitDetailsDTO;
import com.wallet.dtos.TransferAuthDataDTO;
import com.wallet.dtos.TransferIntentOtpDTO;
import com.wallet.dtos.WalletJobDTO;
import com.wallet.jobqueue.WalletQueueProducer;
import com.wallet.responses.ApiResponse;
import com.wallet.responses.Pagination;
import com.wallet.responses.WalletTransactionResponse;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import com.wallet.models.Wallet;
import com.wallet.models.WalletBeneficiary;
import com.wallet.models.WalletTransaction;
import com.wallet.models.enums.WalletOperationType;
import com.wallet.models.enums.WalletTransactionType;
import com.wallet.models.Account;
import com.wallet.repository.BeneficiaryRepository;
import com.wallet.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;


@Service
public class WalletService {
    @Autowired
    private WalletRepository walletRepository;

    @Autowired BeneficiaryRepository walletBeneficiaryRepository;

    @Autowired
    private WalletOperations walletOperations;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private  WalletQueueProducer walletQueueProducer;

    public String generateUniqueWalletAccountNo() {
        String walletNo;
        Random random = new Random();

        do {
            walletNo = "234" + String.format("%07d", random.nextInt(10_000_000));
        } while (walletRepository.findByWalletAccountNo(walletNo).isPresent());

        return walletNo;
    }

    public Wallet createWallet(Wallet wallet, Account account) {
        wallet.setAccount(account);
        wallet.setWalletAccountNo(generateUniqueWalletAccountNo());
        return walletRepository.save(wallet);
    }

    public WalletTransactionResponse fetchWalletAndTransactions(
            int page,
            int limit,
            String searchText,
            String typeFilter,
            String operationTypeFilter,
            String accountId) {
        Wallet wallet = walletRepository.findByAccountId(accountId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        Query query = new Query();
        query.addCriteria(Criteria.where("account").is(accountId));

        if (typeFilter != null && !typeFilter.isEmpty()) {
            query.addCriteria(Criteria.where("type").is(typeFilter));
        }

        if (operationTypeFilter != null && !operationTypeFilter.isEmpty()) {
            query.addCriteria(Criteria.where("operationType").is(operationTypeFilter));
        }

        if (searchText != null && !searchText.isEmpty()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("type").regex(searchText, "i"),
                    Criteria.where("operationType").regex(searchText, "i")));
        }

        long totalDocuments = mongoTemplate.count(query, WalletTransaction.class);

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.skip((page - 1) * limit);
        query.limit(limit);

        List<WalletTransaction> transactions = mongoTemplate.find(query, WalletTransaction.class);

        return new WalletTransactionResponse(wallet, transactions, new Pagination(
                page,
                (int) Math.ceil((double) totalDocuments / limit),
                (int) totalDocuments));
    }

    public void UpdateWalletBalance(WalletJobDTO job) throws Exception {
        WalletTransactionType jobType = job.getWalletJobType();
        BigDecimal amount = job.getAmount();
        WalletOperationType operationType = job.getOperationType();
        CreditDetailsDTO CreditDetails = job.getCreditDetails();

        if (jobType == WalletTransactionType.DIRECT_TOPUP) {
            walletOperations.DirectWalletTopUp(jobType, amount, operationType, CreditDetails);
        }

        if(jobType == WalletTransactionType.WALLET_TRANSFER){
            walletOperations.WalletTransfer(job);
        }

    }

    public ApiResponse<?> GetRecipientWallet(String walletId, String accountId, boolean isTransfer) {
        try {
            Wallet wallet = null;

            if (accountId != null && !accountId.isEmpty()) {
                wallet = walletRepository.findByAccountId(accountId)
                        .orElseThrow(() -> new RuntimeException("Wallet not created"));
            }

            if (isTransfer && wallet != null && wallet.getWalletAccountNo().equals(walletId)) {
                return new ApiResponse<>(false,
                        "You cannot make a transfer to your own wallet, you can only transfer to other Javapp wallets",
                        null, 400);
            }

            Wallet recipientWallet = walletRepository.findByWalletAccountNo(walletId)
                    .orElseThrow(() -> new RuntimeException("Wallet not created"));

            if (recipientWallet == null) {
                return new ApiResponse<>(false, "Failed to retrieve recipient wallet!", null, 400);
            }

            return new ApiResponse<>(true, "Recipient wallet retrieved successfully!", recipientWallet, 200);

        } catch (Exception e) {
            throw new RuntimeException("Error fetching recipient wallet", e);
        }
    }

    public ApiResponse<?> FetchWalletBeneficiaries(String accountId, int page, int limit) {
    try {
        int pageNumber = (page <= 0) ? 0 : page - 1;
        Pageable pageable = PageRequest.of(pageNumber, limit, Sort.by(Sort.Direction.DESC, "createdAt"));

        Optional<Wallet> walletOptional = walletRepository.findByAccountId(accountId);
        Wallet wallet = walletOptional.orElse(null);

        Page<WalletBeneficiary> beneficiaryPage = walletBeneficiaryRepository
                .findByAccountId(accountId, pageable);

        List<WalletBeneficiary> beneficiaries = beneficiaryPage.getContent();

        Map<String, Object> pagination = Map.of(
            "currentPage", page,
            "totalPages", beneficiaryPage.getTotalPages(),
            "totalDocuments", beneficiaryPage.getTotalElements()
        );

        Map<String, Object> data = new HashMap<>();
        data.put("beneficiaries", beneficiaries);
        data.put("wallet", wallet);
        data.put("pagination", pagination);

        return new ApiResponse<>(true, "Fetched wallet beneficiaries", data, 200);
    } catch (Exception e) {
        return new ApiResponse<>(false, e.getMessage(), null, 500);
    }
}


    public ApiResponse<?> SendTransferOtp(TransferIntentOtpDTO transferIntent, String accountId) {
        try {
            Wallet debitWallet = walletRepository.findByWalletAccountNo(transferIntent.getWalletToDebit())
                    .orElseThrow(() -> new RuntimeException("Creditor Wallet not found"));
            Wallet creditWallet = walletRepository.findByWalletAccountNo(transferIntent.getWalletToCredit())
                    .orElseThrow(() -> new RuntimeException("Receipient Wallet not found"));

            if (debitWallet == null || creditWallet == null) {
                return new ApiResponse<>(false, "Creditor/Debitor was not found for this request", null, 400);

            }

            String otp = String.valueOf(new Random().nextInt(900000) + 100000);
            long otpExpiry = System.currentTimeMillis() + 2 * 60 * 1000;
            // String cacheKey = transferIntent.getWalletToDebit() + ":" +
            // transferIntent.getWalletToCredit();
            debitWallet.setOtp(otp);
            debitWallet.setOtpExpiry(otpExpiry);// 2 min expiry
            walletRepository.save(debitWallet);

            Account account = debitWallet.getAccount();
            transferIntent.setSenderAccount(account);
            sendOtpEmail(account.getEmail(), otp, "Transfer OTP sent");

            // mailService.sendTransferOtpEmail(user.getEmail(), otp, transferIntent);

            return new ApiResponse<>(true, "Transfer OTP sent successfully", null, 200);

        } catch (Exception ex) {
            return new ApiResponse<>(false, ex.getMessage(), null, 500);
        }
    }

    public ApiResponse<?> VerifyTransferOtp(TransferAuthDataDTO transferData, String accountId) {
        try {
            String walletToDebit = transferData.getDebitDetails().getWalletAccountNo();
            String walletToCredit = transferData.getCreditDetails().getWalletAccountNo();
            String otp = transferData.getOtp();

            Wallet debitWallet = walletRepository.findByWalletAccountNo(walletToDebit)
                    .orElseThrow(() -> new RuntimeException("Creditor Wallet not found"));
            Wallet creditWallet = walletRepository.findByWalletAccountNo(walletToCredit)
                    .orElseThrow(() -> new RuntimeException("Receipient Wallet not found"));

            if (debitWallet == null || creditWallet == null) {
                return new ApiResponse<>(false, "Creditor/Debitor was not found for this request", null, 400);

            }

            if (debitWallet.getOtp() != null && debitWallet.getOtp().equals(otp) && System.currentTimeMillis() < debitWallet.getOtpExpiry()) {
                WalletJobDTO walletTransferJob = BuildTransferJob(transferData);
                walletQueueProducer.walletBalanceUpdateJob(walletTransferJob);
                return new ApiResponse<>(true, "Transfer request authorized", null, 200);
            }

            return new ApiResponse<>(false, "Transfer request authorization failed, otp may be expired", null, 400);
        } catch (Exception ex) {
            return new ApiResponse<>(false, ex.getMessage(), null, 500);

        }
    }

    private WalletJobDTO BuildTransferJob(TransferAuthDataDTO transferData){
        WalletJobDTO walletTransferJob  = new WalletJobDTO();
            walletTransferJob.setWalletJobType(WalletTransactionType.WALLET_TRANSFER);
            walletTransferJob.setWalletAccountNo(transferData.getDebitDetails().getWalletAccountNo());
            walletTransferJob.setAmount(transferData.getSourceAmount());
            walletTransferJob.setOperationType(WalletOperationType.CREDIT);
            walletTransferJob.setSaveBeneficiary(transferData.isSaveBeneficiary());

            CreditDetailsDTO CreditDetails = new CreditDetailsDTO();
            CreditDetails.setAmount(walletTransferJob.getAmount());
            CreditDetails.setCurrency(transferData.getTargetCurrency());
            CreditDetails.setWalletAccountNo(transferData.getCreditDetails().getWalletAccountNo());

            DebitDetailsDTO DeditDetails = new DebitDetailsDTO(); 
            DeditDetails.setAmount(walletTransferJob.getAmount());
            DeditDetails.setCurrency(transferData.getSourceCurrency());
            DeditDetails.setWalletAccountNo(transferData.getDebitDetails().getWalletAccountNo());
            DeditDetails.setOtp(transferData.getOtp());
            
            walletTransferJob.setDebitDetails(DeditDetails);

            walletTransferJob.setCreditDetails(CreditDetails);
            return walletTransferJob;
           
    }

    private void sendOtpEmail(String to, String otp, String subject) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("no-reply@crygoca.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText("Your OTP code is: " + otp);
        mailSender.send(message);
    }

}