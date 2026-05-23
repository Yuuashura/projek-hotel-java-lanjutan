package com.ngninep.user.service.impl;

import com.ngninep.user.dto.ChangePasswordRequest;
import com.ngninep.user.dto.UpdateProfileRequest;
import com.ngninep.user.dto.UserProfileResponse;
import com.ngninep.user.entity.Customer;
import com.ngninep.user.repository.CustomerRepository;
import com.ngninep.user.service.FileStorageService;
import com.ngninep.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Override
    public UserProfileResponse getProfile(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User tidak ditemukan"));

        return toProfileResponse(customer);
    }

    @Override
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

    @Override
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
                .is_verified(customer.isVerified())
                .is_banned(customer.isBanned())
                .profile_picture(customer.getProfile_picture())
                .build();
    }

    @Override
    public java.util.List<UserProfileResponse> getAllUsers(Integer page, Integer size) {
        Pageable pageable = toPageable(page, size);
        java.util.List<Customer> customers = pageable != null
                ? customerRepository.findAll(pageable).getContent()
                : customerRepository.findAll();
        return customers.stream()
                .map(this::toProfileResponse)
                .toList();
    }

    @Override
    public UserProfileResponse updateProfilePicture(String email, MultipartFile file) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User tidak ditemukan"));

        String imageUrl = fileStorageService.saveProfilePicture(file);
        customer.setProfile_picture(imageUrl);
        customerRepository.save(customer);
        return toProfileResponse(customer);
    }

    @Override
    public String banUser(int userId) {
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User tidak ditemukan"));
        customer.setBanned(true);
        customerRepository.save(customer);
        return "User berhasil diban";
    }

    @Override
    public String unbanUser(int userId) {
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User tidak ditemukan"));
        customer.setBanned(false);
        customerRepository.save(customer);
        return "User berhasil di-unban";
    }

    private Pageable toPageable(Integer page, Integer size) {
        if (page == null && size == null) {
            return null;
        }

        int safePage = page != null && page >= 0 ? page : 0;
        int safeSize = size != null && size > 0 ? Math.min(size, 100) : 10;
        return PageRequest.of(safePage, safeSize);
    }
}
