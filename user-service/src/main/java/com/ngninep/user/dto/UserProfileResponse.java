package com.ngninep.user.dto;

import com.ngninep.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private int id_customer;
    private String first_name;
    private String last_name;
    private int age;
    private int city_id;
    private String phone;
    private String email;
    private Role role;
    @JsonProperty("is_verified")
    private boolean is_verified;
    
    @JsonProperty("is_banned")
    private boolean is_banned;
    
    private String profile_picture;
}
