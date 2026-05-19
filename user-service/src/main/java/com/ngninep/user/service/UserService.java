package com.ngninep.user.service;

import com.ngninep.user.dto.ChangePasswordRequest;
import com.ngninep.user.dto.UpdateProfileRequest;
import com.ngninep.user.dto.UserProfileResponse;
import java.util.List;

public interface UserService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    String changePassword(String email, ChangePasswordRequest request);
    List<UserProfileResponse> getAllUsers();
    String banUser(int userId);
    String unbanUser(int userId);
}
