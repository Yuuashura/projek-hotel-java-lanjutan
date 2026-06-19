package com.ngninep.user.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String first_name;
    private String last_name;
    private int age;
    private int city_id;
    @Pattern(regexp = "^08\\d{0,12}$", message = "Nomor telepon harus diawali 08 dan maksimal 14 digit")
    private String phone;
    private String profile_picture;
}
