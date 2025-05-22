package com.wallet.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.wallet.dtos.LoginDTO;
import com.wallet.dtos.RegisterDTO;
import com.wallet.dtos.VerifyOtpDTO;
import com.wallet.dtos.OtpResendDTO;


import com.wallet.responses.ApiResponse;
import com.wallet.services.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ApiResponse<String> login(@RequestBody LoginDTO payload) {
        return userService.loginUser(payload);
    }

    @PostMapping("/register")
    public ApiResponse<String> register(@RequestBody RegisterDTO body) {
        return userService.registerUser(body);
    }

    @PostMapping("/registration-verify-otp")
    public ApiResponse<String> verifyOtp(@RequestBody VerifyOtpDTO payload) {
        return userService.verifyOtp(payload.getEmail(), payload.getOtp());
    }

    @PostMapping("/login-verify-otp")
    public ApiResponse<String> verifyLoginOtp(@RequestBody VerifyOtpDTO payload) {
        return userService.verifyLoginOtp(payload.getEmail(), payload.getOtp());
    }

    @PostMapping("/resend-registration-otp")
    public ApiResponse<String> resendRegistrationOtp(@RequestBody OtpResendDTO body) {
        return userService.resendRegistrationOtp(body);
    }

    @PostMapping("/resend-login-otp")
    public ApiResponse<String> resendLoginOtp(@RequestBody OtpResendDTO body) {
        return userService.resendLoginOtp(body);
    }
}