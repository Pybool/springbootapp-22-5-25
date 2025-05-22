package com.wallet.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.core.ParameterizedTypeReference;

import com.wallet.responses.ApiResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.client.RestTemplate;

import com.wallet.dtos.CreditDetailsDTO;
import com.wallet.dtos.PaystackCustomerDTO;
import com.wallet.dtos.PaystackVerificationDataDTO;
import com.wallet.dtos.WalletJobDTO;
import com.wallet.jobqueue.WalletQueueProducer;
import com.wallet.models.PaystackVerifiedTransaction;
import com.wallet.models.Wallet;
import com.wallet.models.enums.WalletOperationType;
import com.wallet.models.enums.WalletTransactionType;
import com.wallet.repository.PaystackVerifiedTransactionRepository;
import com.wallet.repository.WalletRepository;

@Service
public class PaystackService {

    @Value("${javapp.env.paystack.secret-key}")
    private String paystackSecretKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletQueueProducer walletQueueProducer;

    @Autowired
    private PaystackVerifiedTransactionRepository paystackVerifiedTransactionRepository;

    public ApiResponse<?> VerifyTransaction(String reference, String expectedAmount, String expectedCurrency) {
        String apiUrl = String.format("https://api.paystack.co/transaction/verify/%s?external=1", reference);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(paystackSecretKey);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                apiUrl,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {
                });

        Map<String, Object> responseBody = response.getBody();
        System.out.println("Paystack response body: " + responseBody);

        if (responseBody != null && Boolean.TRUE.equals(responseBody.get("status"))) {
            Map<String, Object> data = (Map<String, Object>) responseBody.get("data");

            int actualAmountKobo = (int) data.get("amount");
            String actualCurrency = (String) data.get("currency");
            int expectedAmountKobo = Integer.parseInt(expectedAmount);

            if (actualAmountKobo != expectedAmountKobo || !actualCurrency.equalsIgnoreCase(expectedCurrency)) {
                return new ApiResponse<>(false, "Amount or currency mismatch", null, 400);
            }

            Map<String, Object> savedResponse = savePaystackTransaction(reference, data);
            System.out.println("Saved Paystack Transaction Response: " + savedResponse);
            return new ApiResponse<>(true, "Transaction verified", data, 200);
        } else {
            return new ApiResponse<>(false, "Transaction verification failed", null, 400);
        }

    }

    @Transactional
    public Map<String, Object> savePaystackTransaction(String reference, Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> customer = (Map<String, Object>) data.get("customer");
            PaystackCustomerDTO paystackCustomer = new PaystackCustomerDTO();
            paystackCustomer.setId(String.valueOf(customer.get("id")));
            paystackCustomer.setFirstname((String) customer.get("first_name"));
            paystackCustomer.setLastname((String) customer.get("last_name"));
            paystackCustomer.setEmail((String) customer.get("email"));
            paystackCustomer.setCustomerCode((String) customer.get("customer_code"));
            paystackCustomer.setPhone((String) customer.get("phone"));

            PaystackVerificationDataDTO paystackVerificationData = new PaystackVerificationDataDTO();
            BigDecimal fees = BigDecimal.valueOf(((Number) data.get("fees")).longValue());
            BigDecimal amount = BigDecimal.valueOf(((Number) data.get("amount")).longValue());
            BigDecimal requested_amount = BigDecimal.valueOf(((Number) data.get("requested_amount")).longValue());
            paystackVerificationData.setAmount(amount);
            paystackVerificationData.setRequestedAmount(requested_amount); 
            paystackVerificationData.setCurrency((String) data.get("currency"));
            paystackVerificationData.setStatus((String) data.get("status"));
            paystackVerificationData.setReference((String) data.get("reference"));
            paystackVerificationData.setChannel((String) data.get("channel"));
            paystackVerificationData.setFees(fees);
            paystackVerificationData.setPaidAt((String) data.get("paid_at"));
            paystackVerificationData.setCreatedAt((String) data.get("created_at"));
            paystackVerificationData.setCustomer(paystackCustomer);

            PaystackVerifiedTransaction verifiedTransaction = new PaystackVerifiedTransaction();
            verifiedTransaction.setTxRef(reference);
            verifiedTransaction.setData(paystackVerificationData);
            verifiedTransaction.setCreatedAt(LocalDateTime.now());
            paystackVerifiedTransactionRepository.save(verifiedTransaction);

            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String accountId = principal instanceof String ? (String) principal
                    : ((UserDetails) principal).getUsername();

            Optional<Wallet> walletOptional = walletRepository.findByAccountId(accountId);

            if (!walletOptional.isPresent()) {
                response.put("status", false);
                response.put("message", "Wallet not found for user");
                return response;
            }

            String walletAccountNo = walletOptional.get().getWalletAccountNo();

            WalletJobDTO walletDirectTopUpJob  = new WalletJobDTO();
            walletDirectTopUpJob.setWalletJobType(WalletTransactionType.DIRECT_TOPUP);
            walletDirectTopUpJob.setWalletAccountNo(walletAccountNo);
            walletDirectTopUpJob.setAmount(paystackVerificationData.getAmount());
            walletDirectTopUpJob.setOperationType(WalletOperationType.CREDIT);
            walletDirectTopUpJob.setVerifiedTransactionId(verifiedTransaction.getId());

            CreditDetailsDTO CreditDetails = new CreditDetailsDTO(); 
            CreditDetails.setAmount(walletDirectTopUpJob.getAmount());
            CreditDetails.setCurrency("NGN");
            CreditDetails.setWalletAccountNo(walletDirectTopUpJob.getWalletAccountNo());

            walletDirectTopUpJob.setCreditDetails(CreditDetails);
            
            walletQueueProducer.walletBalanceUpdateJob(walletDirectTopUpJob);

            response.put("status", true);
            response.put("message", "Transaction saved and queued for wallet top-up");
            return response;

        } catch (Exception e) {
            response.put("status", false);
            response.put("message", "Failed to save transaction: " + e.getMessage());
            return response;
        }
    }

}
