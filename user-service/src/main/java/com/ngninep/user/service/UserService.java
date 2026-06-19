package com.ngninep.user.service;

import com.ngninep.user.dto.ChangePasswordRequest;
import com.ngninep.user.dto.UpdateProfileRequest;
import com.ngninep.user.dto.UserProfileResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface UserService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    String changePassword(String email, ChangePasswordRequest request);
    List<UserProfileResponse> getAllUsers(Integer page, Integer size);
    List<UserProfileResponse> getAdminHotels(Integer page, Integer size);
    UserProfileResponse updateProfilePicture(String email, MultipartFile file);
    String banUser(int userId);
    String unbanUser(int userId);
}
