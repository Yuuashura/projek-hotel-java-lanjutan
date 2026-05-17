package com.ngninep.user.dto;

import com.ngninep.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String email;
    private String first_name;
    private String last_name;
    private Role role;
    private String message;
}
