package com.ngninep.user.service.impl;

import com.ngninep.user.dto.*;
import com.ngninep.user.entity.Customer;
import com.ngninep.user.entity.OtpToken;
import com.ngninep.user.entity.Role;
import com.ngninep.user.repository.CustomerRepository;
import com.ngninep.user.config.JwtUtil;
import com.ngninep.user.service.AuthService;
import com.ngninep.user.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private static final OtpToken.Purpose REGISTER_PURPOSE = OtpToken.Purpose.REGISTER_VERIFICATION;
    private static final OtpToken.Purpose RESET_PURPOSE = OtpToken.Purpose.PASSWORD_RESET;
    private static final String FORGOT_PASSWORD_RESPONSE =
            "Jika email terdaftar, kode reset password akan dikirim.";

    // ==================== REGISTER ====================
    @Override
    public String register(RegisterRequest request) {
        Optional<Customer> existing = customerRepository.findByEmail(request.getEmail());

        if (existing.isPresent()) {
            Customer customer = existing.get();
            if (customer.isVerified()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email sudah terdaftar");
            } else {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "UNVERIFIED_ACCOUNT:" + request.getEmail());
            }
        }

        Customer newCustomer = Customer.builder()
                .first_name(request.getFirst_name())
                .last_name(request.getLast_name())
                .age(request.getAge())
                .city_id(request.getCity_id())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .verified(false)
                .banned(false)
                .role(Role.ROLE_USER)
                .build();

        customerRepository.save(newCustomer);
        otpService.generateAndSendOtp(request.getEmail(), REGISTER_PURPOSE);

        return "Registrasi berhasil. Silakan cek email untuk kode OTP.";
    }

    // ==================== VERIFY OTP ====================
    @Override
    public String verifyOtp(VerifyOtpRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Akun tidak ditemukan"));

        if (customer.isVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Akun sudah terverifikasi, silakan login");
        }

        String result = otpService.validateOtp(request.getEmail(), request.getOtp_code(), REGISTER_PURPOSE);

        switch (result) {
            case "OTP_INVALID" ->
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode OTP tidak valid");
            case "OTP_EXPIRED" ->
                throw new ResponseStatusException(HttpStatus.GONE, "Kode OTP sudah kadaluarsa");
            case "OTP_NOT_FOUND" ->
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode OTP tidak ditemukan");
        }

        customer.setVerified(true);
        customerRepository.save(customer);

        return "Verifikasi berhasil! Silakan login.";
    }

    // ==================== RESEND OTP ====================
    @Override
    public String resendOtp(ResendOtpRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Akun tidak ditemukan"));

        if (customer.isVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Akun sudah terverifikasi, silakan login");
        }

        Optional<OtpToken> activeOtp = otpService.getActiveOtp(request.getEmail(), REGISTER_PURPOSE);
        if (activeOtp.isPresent()) {
            LocalDateTime canResendAt = activeOtp.get().getCreatedAt().plusMinutes(5);
            if (LocalDateTime.now().isBefore(canResendAt)) {
                long secondsLeft = java.time.Duration.between(LocalDateTime.now(), canResendAt).getSeconds();
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Mohon tunggu " + secondsLeft + " detik sebelum meminta OTP baru");
            }
        }

        otpService.invalidateAllActiveOtp(request.getEmail(), REGISTER_PURPOSE);
        otpService.generateAndSendOtp(request.getEmail(), REGISTER_PURPOSE);

        return "OTP baru telah dikirim ke email " + request.getEmail();
    }

    // ==================== FORGOT PASSWORD ====================
    @Override
    public String forgotPassword(ForgotPasswordRequest request) {
        Optional<Customer> optionalCustomer = customerRepository.findByEmail(request.getEmail());

        if (optionalCustomer.isEmpty()) {
            return FORGOT_PASSWORD_RESPONSE;
        }

        Customer customer = optionalCustomer.get();
        if (!customer.isVerified() || customer.isBanned()) {
            return FORGOT_PASSWORD_RESPONSE;
        }

        Optional<OtpToken> activeOtp = otpService.getActiveOtp(request.getEmail(), RESET_PURPOSE);
        if (activeOtp.isPresent()) {
            LocalDateTime canResendAt = activeOtp.get().getCreatedAt().plusMinutes(5);
            if (LocalDateTime.now().isBefore(canResendAt)) {
                return FORGOT_PASSWORD_RESPONSE;
            }
        }

        otpService.invalidateAllActiveOtp(request.getEmail(), RESET_PURPOSE);
        otpService.generateAndSendOtp(request.getEmail(), RESET_PURPOSE);

        return FORGOT_PASSWORD_RESPONSE;
    }

    // ==================== VERIFY RESET OTP ====================
    @Override
    public String verifyResetOtp(VerifyOtpRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode reset tidak valid"));

        if (!customer.isVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Akun belum terverifikasi");
        }

        if (customer.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Akun Anda telah dinonaktifkan");
        }

        String result = otpService.checkOtp(request.getEmail(), request.getOtp_code(), RESET_PURPOSE);

        switch (result) {
            case "OTP_INVALID" ->
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode reset tidak valid");
            case "OTP_EXPIRED" ->
                throw new ResponseStatusException(HttpStatus.GONE, "Kode reset sudah kadaluarsa");
            case "OTP_NOT_FOUND" ->
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode reset tidak ditemukan");
        }

        return "Kode reset valid. Silakan buat password baru.";
    }

    // ==================== RESET PASSWORD ====================
    @Override
    public String resetPassword(ResetPasswordRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode reset tidak valid"));

        if (!customer.isVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Akun belum terverifikasi");
        }

        if (customer.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Akun Anda telah dinonaktifkan");
        }

        String result = otpService.validateOtp(request.getEmail(), request.getOtp_code(), RESET_PURPOSE);

        switch (result) {
            case "OTP_INVALID" ->
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode reset tidak valid");
            case "OTP_EXPIRED" ->
                throw new ResponseStatusException(HttpStatus.GONE, "Kode reset sudah kadaluarsa");
            case "OTP_NOT_FOUND" ->
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kode reset tidak ditemukan");
        }

        customer.setPassword(passwordEncoder.encode(request.getNew_password()));
        customerRepository.save(customer);

        return "Password berhasil direset. Silakan login kembali.";
    }

    // ==================== LOGIN ====================
    @Override
    public LoginResponse login(LoginRequest request) {
        Customer customer = customerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email atau password salah"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email atau password salah");
        }

        if (!customer.isVerified()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "UNVERIFIED_ACCOUNT:" + customer.getEmail());
        }

        if (customer.isBanned()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Akun Anda telah dinonaktifkan");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(customer.getEmail());
        String token = jwtUtil.generateToken(userDetails, customer.getId_customer());

        return LoginResponse.builder()
                .token(token)
                .id_customer(customer.getId_customer())
                .email(customer.getEmail())
                .first_name(customer.getFirst_name())
                .last_name(customer.getLast_name())
                .role(customer.getRole())
                .message("Login berhasil")
                .build();
    }
}
