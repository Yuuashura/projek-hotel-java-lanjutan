    package com.ngninep.hotel.util;

public final class Message {

    private Message() {
    }

    public static final String SUCCESS = "Success";
    public static final String GENERAL_ERROR_PREFIX = "Terjadi kesalahan: ";

    public static final String HOTEL_NOT_FOUND = "Hotel tidak ditemukan";
    public static final String HOTEL_INVALID = "Hotel tidak valid";
    public static final String HOTEL_ACCESS_DENIED = "Anda tidak memiliki akses ke hotel ini";
    public static final String HOTEL_FACILITY_ADDED = "Fasilitas hotel berhasil ditambahkan";
    public static final String HOTEL_FACILITY_REMOVED = "Fasilitas hotel berhasil dihapus";
    public static final String HOTEL_IMAGE_UPLOADED = "Gambar hotel berhasil diunggah";
    public static final String HOTEL_NAME_REQUIRED = "Nama hotel tidak boleh kosong";
    public static final String HOTEL_ID_REQUIRED = "ID Hotel tidak boleh kosong";

    public static final String CITY_NOT_FOUND = "Kota tidak ditemukan";
    public static final String CITY_INVALID = "Kota tidak valid";
    public static final String CITY_WITH_ID_NOT_FOUND = "Kota dengan ID %d tidak ditemukan";
    public static final String CITY_NAME_REQUIRED = "Nama kota tidak boleh kosong";
    public static final String CITY_ID_REQUIRED = "ID Kota tidak boleh kosong";

    public static final String FACILITY_NOT_FOUND = "Fasilitas tidak ditemukan";
    public static final String FACILITY_INVALID = "Fasilitas tidak valid";
    public static final String FACILITY_NAME_REQUIRED = "Nama fasilitas tidak boleh kosong";

    public static final String ROOM_TYPE_NOT_FOUND = "Tipe kamar tidak ditemukan";
    public static final String ROOM_TYPE_IMAGE_UPLOADED = "Gambar tipe kamar berhasil diunggah";
    public static final String ROOM_TYPE_NAME_REQUIRED = "Nama tipe kamar tidak boleh kosong";

    public static final String EXCEL_UPLOADED = "Excel berhasil diunggah";
    public static final String FILE_EMPTY = "File kosong";
    public static final String FILE_MUST_BE_EXCEL = "File harus berupa excel";
    public static final String FILE_SAVE_FAILED = "Gagal menyimpan file";
    public static final String IMAGE_FILE_EMPTY = "File gambar tidak boleh kosong";
    public static final String IMAGE_FILE_MAX_SIZE = "Ukuran file maksimal 5MB";
    public static final String IMAGE_FILE_INVALID_FORMAT = "Format gambar harus JPG, PNG, atau WEBP";
}
