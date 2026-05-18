package com.ngninep.user.service;

import com.ngninep.user.dto.LoginRequest;
import com.ngninep.user.dto.LoginResponse;
import com.ngninep.user.dto.RegisterRequest;
import com.ngninep.user.dto.ResendOtpRequest;
import com.ngninep.user.dto.VerifyOtpRequest;

public interface AuthService {
    String register(RegisterRequest request);
    String verifyOtp(VerifyOtpRequest request);
    String resendOtp(ResendOtpRequest request);
    LoginResponse login(LoginRequest request);
}
