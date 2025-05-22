package com.wallet.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.wallet.dtos.RegisterDTO;
import com.wallet.repository.UserRepository;
import com.wallet.dtos.LoginDTO;
import com.wallet.dtos.OtpResendDTO;
import com.wallet.responses.ApiResponse;
import com.wallet.utils.JwtUtil;
import com.wallet.models.Account;
import com.wallet.models.Wallet;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

@Service
public class UserService {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private WalletService walletService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    @Transactional
    public ApiResponse<String> registerUser(RegisterDTO payload) {
        Optional<Account> userOpt = userRepository.findByEmail(payload.getEmail());
        if (userOpt.isPresent()) {
            return new ApiResponse<>(
                    false,
                    "Email already exists",
                    null,
                    409);
        }
        String hashedPassword = passwordEncoder.encode(payload.getPassword());

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        long otpExpiry = System.currentTimeMillis() + 5 * 60 * 1000;

        Account account = new Account();
        account.setEmail(payload.getEmail());
        account.setUsername(payload.getUsername());
        account.setPassword(hashedPassword);
        account.setOtp(otp);
        account.setOtpExpiry(otpExpiry);
        Account savedAccount = userRepository.save(account);
        System.out.println("Saved Account ID: " + savedAccount.getId());

        sendOtpEmail(account.getEmail(), otp, "Your Registration OTP Code");

        return new ApiResponse<String>(
                true,
                "Registration was successful",
                null,
                200);
    }

    public ApiResponse<String> loginUser(LoginDTO payload) {
        Optional<Account> userOpt = userRepository.findByEmail(payload.getEmail());

        if (userOpt.isPresent()) {
            Account account = userOpt.get();

            if (passwordEncoder.matches(payload.getPassword(), account.getPassword())) {
                String otp = String.valueOf(new Random().nextInt(900000) + 100000);
                long otpExpiry = System.currentTimeMillis() + 5 * 60 * 1000;
                account.setOtp(otp);
                account.setOtpExpiry(otpExpiry);
                userRepository.save(account);
                sendOtpEmail(account.getEmail(), otp, "Your Login OTP Code");
                return new ApiResponse<>(
                        true,
                        "Login was successful",
                        null,
                        200);
            } else {
                return new ApiResponse<>(
                        false,
                        "Invalid email or password",
                        null,
                        401);
            }
        }

        return new ApiResponse<>(
                false,
                "Invalid email or password",
                null,
                401);
    }

    public ApiResponse<String> verifyOtp(String email, String otp) {
        Optional<Account> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            Account account = userOpt.get();
            if (account.getOtp().equals(otp) && System.currentTimeMillis() < account.getOtpExpiry()) {
                account.setOtp(null); 
                account.setEmailVerified(true);
                account.setOtpExpiry(0);
                userRepository.save(account);
                Wallet wallet = new Wallet();
                wallet.setCreatedAt(LocalDateTime.now());
                walletService.createWallet(wallet, account);
                return new ApiResponse<String>(
                        true,
                        "User registered and wallet created",
                        null,
                        200);
            }
            return new ApiResponse<String>(
                    false,
                    "Invalid or expired OTP",
                    "",
                    400);
        }
        return new ApiResponse<String>(
                false,
                "User not found",
                "",
                404);
    }

    public ApiResponse<String> verifyLoginOtp(String email, String otp) {
        Optional<Account> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            Account account = userOpt.get();
            if (account.getOtp().equals(otp) && System.currentTimeMillis() < account.getOtpExpiry()) {
                account.setOtp(null); 
                account.setEmailVerified(true);
                account.setOtpExpiry(0);
                Account savedAccount = userRepository.save(account);
                System.out.println("Saved Account ID: " + savedAccount.getId());
                String token = jwtUtil.generateToken(savedAccount.getId());
                return new ApiResponse<String>(
                        true,
                        "Your login was successfull",
                        token,
                        200);
            }
            return new ApiResponse<String>(
                    false,
                    "Invalid or expired OTP",
                    "",
                    400);
        }
        return new ApiResponse<String>(
                false,
                "User not found",
                "",
                404);
    }

    public ApiResponse<String> resendRegistrationOtp(OtpResendDTO payload) {
        return resendOtp(payload, "Your Registration OTP Code", "Registration OTP has been resent successfully");
    }

    public ApiResponse<String> resendLoginOtp(OtpResendDTO payload) {
        return resendOtp(payload, "Your Login OTP Code", "Login OTP has been resent successfully");
    }

    private ApiResponse<String> resendOtp(OtpResendDTO payload, String emailSubject, String successMessage) {
        Optional<Account> userOpt = userRepository.findByEmail(payload.getEmail());
        if (!userOpt.isPresent()) {
            return new ApiResponse<>(
                    false,
                    "Email does not exist",
                    null,
                    400);
        }

        Account account = userOpt.get();

        if (emailSubject == "Your Registration OTP Code") {
            if (account.getEmailVerified()) {
                return new ApiResponse<>(
                        false,
                        "Email has already been previously verified",
                        null,
                        400);
            }
        }

        if (emailSubject == "Your Login OTP Code") {
            if (!account.getEmailVerified()) {
                return new ApiResponse<>(
                        false,
                        "Email was not previously verified during registration",
                        null,
                        400);
            }
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
        long otpExpiry = System.currentTimeMillis() + 5 * 60 * 1000;
        account.setOtp(otp);
        account.setOtpExpiry(otpExpiry);

        userRepository.save(account);
        sendOtpEmail(account.getEmail(), otp, emailSubject);

        return new ApiResponse<>(
                true,
                successMessage,
                null,
                200);
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
