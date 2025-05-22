package com.wallet.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com.wallet.dtos.VerifyTransactionRequestDTO;
import com.wallet.responses.ApiResponse;
import com.wallet.services.PaystackService;

@RestController
@RequestMapping("/paystack")
public class PaystackTransactionController {

    @Autowired
    private PaystackService paystackService;

    @PostMapping("/verify-transaction")
    public ResponseEntity<ApiResponse<?>> verifyTransaction(@RequestBody VerifyTransactionRequestDTO request) {
        try {
            String reference = request.getRef();
            String expectedAmount = request.getAmount();
            String expectedCurrency = request.getCurrency();

            ApiResponse<?> response = paystackService.VerifyTransaction(reference, expectedAmount, expectedCurrency);
            return ResponseEntity
                    .ok()
                    .body(response);

        } catch (Exception e) {
            String errorMessage = "An error occurred during transaction verification: " + e.getMessage();
        
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, errorMessage, null, 500));
        }
        
    }

}
