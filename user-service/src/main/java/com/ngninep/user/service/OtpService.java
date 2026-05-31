package com.ngninep.user.service;

import com.ngninep.user.entity.OtpToken;

import java.util.Optional;

public interface OtpService {
    void generateAndSendOtp(String email, OtpToken.Purpose purpose);
    Optional<OtpToken> getActiveOtp(String email, OtpToken.Purpose purpose);
    String checkOtp(String email, String otpCode, OtpToken.Purpose purpose);
    String validateOtp(String email, String otpCode, OtpToken.Purpose purpose);
    void invalidateAllActiveOtp(String email, OtpToken.Purpose purpose);
}
