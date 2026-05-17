package com.ngninep.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Password lama wajib diisi")
    private String old_password;

    @NotBlank(message = "Password baru wajib diisi")
    @Size(min = 6, message = "Password baru minimal 6 karakter")
    private String new_password;

    @NotBlank(message = "Konfirmasi password wajib diisi")
    private String confirm_password;
}
