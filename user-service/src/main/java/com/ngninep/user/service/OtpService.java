package com.ngninep.user.service;

import com.ngninep.user.entity.OtpToken;

import java.util.Optional;

public interface OtpService {
    void generateAndSendOtp(String email);
    Optional<OtpToken> getActiveOtp(String email);
    String validateOtp(String email, String otpCode);
    void invalidateAllActiveOtp(String email);
}
