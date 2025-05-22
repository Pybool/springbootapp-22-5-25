package com.wallet.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("accounts")
public class Account {
    @Id
    private String id;
    @Indexed(unique = true)
    private String email;
    @Indexed(unique = true)
    private String username;
    private String password;
    private String otp;
    private long otpExpiry;
    @SuppressWarnings("unused")
    private boolean emailVerified = false;

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getUsername() { return username; }
    public String getOtp() { return otp; }
    public long getOtpExpiry() { return otpExpiry; }
    public boolean getEmailVerified() { return emailVerified; }

    public void setId(String id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setUsername(String username) { this.username = username; }
    public void setOtp(String otp) { this.otp = otp; }
    public void setOtpExpiry(long otpExpiry) { this.otpExpiry = otpExpiry; }
    public void setEmailVerified(boolean emailVerified){ this.emailVerified = emailVerified; }
}
