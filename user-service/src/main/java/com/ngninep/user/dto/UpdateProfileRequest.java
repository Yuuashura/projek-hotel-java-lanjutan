package com.ngninep.user.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String first_name;
    private String last_name;
    private int age;
    private int city_id;
    private String phone;
    private String profile_picture;
}
