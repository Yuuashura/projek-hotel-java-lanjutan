package com.ngninep.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateAdminHotelRequest {

    @NotBlank(message = "First name wajib diisi")
    private String first_name;

    private String last_name;

    @NotNull(message = "Umur wajib diisi")
    private int age;

    private int city_id;

    private String phone;

    @NotBlank(message = "Email wajib diisi")
    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Password wajib diisi")
    @Size(min = 6, message = "Password minimal 6 karakter")
    private String password;
}
