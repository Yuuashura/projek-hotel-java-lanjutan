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
        otpService.generateAndSendOtp(request.getEmail());

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

        String result = otpService.validateOtp(request.getEmail(), request.getOtp_code());

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

        Optional<OtpToken> activeOtp = otpService.getActiveOtp(request.getEmail());
        if (activeOtp.isPresent()) {
            LocalDateTime canResendAt = activeOtp.get().getCreatedAt().plusMinutes(5);
            if (LocalDateTime.now().isBefore(canResendAt)) {
                long secondsLeft = java.time.Duration.between(LocalDateTime.now(), canResendAt).getSeconds();
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Mohon tunggu " + secondsLeft + " detik sebelum meminta OTP baru");
            }
        }

        otpService.invalidateAllActiveOtp(request.getEmail());
        otpService.generateAndSendOtp(request.getEmail());

        return "OTP baru telah dikirim ke email " + request.getEmail();
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
                .email(customer.getEmail())
                .first_name(customer.getFirst_name())
                .last_name(customer.getLast_name())
                .role(customer.getRole())
                .message("Login berhasil")
                .build();
    }
}
