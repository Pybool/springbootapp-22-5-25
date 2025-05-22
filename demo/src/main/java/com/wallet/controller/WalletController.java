package com.wallet.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.wallet.dtos.TransferAuthDataDTO;
import com.wallet.dtos.TransferIntentOtpDTO;
import com.wallet.responses.ApiResponse;
import com.wallet.responses.Pagination;
import com.wallet.responses.WalletTransactionResponse;
import com.wallet.services.WalletService;

@RestController
@RequestMapping("/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/fetch-wallet-transactions")
    public ResponseEntity<?> fetchWalletTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String searchText,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String operationType) {
        try {
            String accountId = (String) SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();

            WalletTransactionResponse response = walletService.fetchWalletAndTransactions(
                    page, limit, searchText, type, operationType, accountId);

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("wallet", response.getWallet());
            responseMap.put("transactions", response.getTransactions());

            Pagination pagination = response.getPagination();
            Map<String, Object> paginationMap = new HashMap<>();
            paginationMap.put("page", pagination.getPage());
            paginationMap.put("totalPages", pagination.getTotalPages());
            paginationMap.put("totalItems", pagination.getTotalItems());

            responseMap.put("pagination", paginationMap);

            ApiResponse<Map<String, Object>> apiResponse = new ApiResponse<>(
                    true,
                    "Fetched wallet transactions successfully",
                    responseMap,
                    HttpStatus.OK.value());

            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            e.printStackTrace();
            ApiResponse<String> errorResponse = new ApiResponse<>(
                    false,
                    "Failed to fetch transactions",
                    null,
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/get-receipient-wallet-details")
    public ApiResponse<?> getReceipientWallet(
            @RequestParam(required = true) String walletId) {
        try {
            String accountId = (String) SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();

            return walletService.GetRecipientWallet(walletId, accountId, true);

        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(
                    false,
                    "Failed to fetch transactions",
                    null,
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

    @PostMapping("/send-transfer-otp")
    public ApiResponse<?> sendTransferOtp(@RequestBody TransferIntentOtpDTO body) {
        String accountId = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return walletService.SendTransferOtp(body, accountId);
    }

    @PostMapping("/transfer-to-wallet")
    public ApiResponse<?> TransferFunds(@RequestBody TransferAuthDataDTO body) {
        String accountId = (String) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return walletService.VerifyTransferOtp(body, accountId);
    }

    @GetMapping("/fetch-beneficiaries")
    public ApiResponse<?> fetchBeneficiaries(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            String accountId = (String) SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getPrincipal();

            return walletService.FetchWalletBeneficiaries(accountId, page, limit);

        } catch (Exception e) {
            e.printStackTrace();
            return new ApiResponse<>(
                    false,
                    "Failed to fetch beneficiaries",
                    null,
                    HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
    }

}
