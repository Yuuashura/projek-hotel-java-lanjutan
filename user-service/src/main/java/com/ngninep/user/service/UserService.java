package com.ngninep.user.service;

import com.ngninep.user.dto.ChangePasswordRequest;
import com.ngninep.user.dto.UpdateProfileRequest;
import com.ngninep.user.dto.UserProfileResponse;
import com.ngninep.user.entity.Customer;
import com.ngninep.user.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== GET PROFILE ====================
    public UserProfileResponse getProfile(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User tidak ditemukan"));

        return toProfileResponse(customer);
    }

    // ==================== UPDATE PROFILE ====================
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User tidak ditemukan"));

        if (request.getFirst_name() != null && !request.getFirst_name().isBlank()) {
            customer.setFirst_name(request.getFirst_name());
        }
        if (request.getLast_name() != null && !request.getLast_name().isBlank()) {
            customer.setLast_name(request.getLast_name());
        }
        if (request.getAge() > 0) {
            customer.setAge(request.getAge());
        }
        if (request.getCity_id() > 0) {
            customer.setCity_id(request.getCity_id());
        }
        if (request.getPhone() != null) {
            customer.setPhone(request.getPhone());
        }
        if (request.getProfile_picture() != null) {
            customer.setProfile_picture(request.getProfile_picture());
        }

        customerRepository.save(customer);
        return toProfileResponse(customer);
    }

    // ==================== CHANGE PASSWORD ====================
    public String changePassword(String email, ChangePasswordRequest request) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User tidak ditemukan"));

        if (!passwordEncoder.matches(request.getOld_password(), customer.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password lama tidak sesuai");
        }

        if (!request.getNew_password().equals(request.getConfirm_password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Konfirmasi password tidak cocok");
        }

        customer.setPassword(passwordEncoder.encode(request.getNew_password()));
        customerRepository.save(customer);

        return "Password berhasil diubah";
    }

    // ==================== HELPER ====================
    private UserProfileResponse toProfileResponse(Customer customer) {
        return UserProfileResponse.builder()
                .id_customer(customer.getId_customer())
                .first_name(customer.getFirst_name())
                .last_name(customer.getLast_name())
                .age(customer.getAge())
                .city_id(customer.getCity_id())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .role(customer.getRole())
                .is_verified(customer.isVerified())     // ✅ isVerified()
                .is_banned(customer.isBanned())         // ✅ isBanned()
                .profile_picture(customer.getProfile_picture())
                .build();
    }
}
