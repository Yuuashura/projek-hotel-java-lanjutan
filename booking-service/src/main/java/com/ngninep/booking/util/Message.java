package com.ngninep.booking.util;

public final class Message {

    private Message() {
    }

    public static final String SUCCESS = "Success";
    public static final String GENERAL_ERROR_PREFIX = "Terjadi kesalahan: ";

    public static final String USER_ID_NOT_FOUND_IN_TOKEN = "User ID tidak ditemukan dalam token";
    public static final String STATUS_REQUIRED = "Status tidak boleh kosong";

    public static final String BOOKING_CREATED = "Pesanan berhasil dibuat";
    public static final String BOOKING_DATA_FETCHED = "Berhasil mengambil data pesanan";
    public static final String BOOKING_PAYMENT_PROCESSED = "Pembayaran berhasil diproses";
    public static final String BOOKING_CANCELLED = "Pesanan berhasil dibatalkan";
    public static final String BOOKING_ALL_FETCHED = "Berhasil mengambil semua pesanan";
    public static final String BOOKING_BY_HOTEL_FETCHED = "Berhasil mengambil pesanan hotel";
    public static final String BOOKING_STATS_FETCHED = "Berhasil mengambil statistik booking";
    public static final String BOOKING_STATUS_UPDATED = "Status pesanan berhasil diperbarui";
    public static final String BOOKING_DELETED = "Pesanan berhasil dihapus secara permanen";
    public static final String XENDIT_INVOICE_CREATED = "Invoice Xendit berhasil dibuat";
    public static final String XENDIT_WEBHOOK_PROCESSED = "Webhook Xendit berhasil diproses";

    public static final String BOOKING_NOT_FOUND = "Booking tidak ditemukan";
    public static final String BOOKING_ACCESS_DENIED = "Anda tidak memiliki akses ke booking ini";
    public static final String BOOKING_ALREADY_PROCESSED = "Booking sudah diproses atau dibatalkan";
    public static final String BOOKING_PAYMENT_DEADLINE_PASSED = "Batas waktu pembayaran sudah lewat";
    public static final String BOOKING_ONLY_PENDING_CAN_BE_CANCELLED = "Hanya pesanan dengan status PENDING yang bisa dibatalkan";
    public static final String BOOKING_PENDING_TRANSITION_ONLY = "Booking PENDING hanya bisa dikonfirmasi atau dibatalkan";
    public static final String BOOKING_CONFIRMED_TRANSITION_ONLY = "Booking CONFIRMED hanya bisa diselesaikan atau dibatalkan";
    public static final String BOOKING_STATUS_CANNOT_BE_CHANGED = "Status %s tidak bisa diubah lagi";
    public static final String BOOKING_STATUS_INVALID = "Status booking tidak valid";

    public static final String CHECK_OUT_AFTER_CHECK_IN = "Tanggal check-out harus setelah check-in";
    public static final String CHECK_IN_NOT_IN_PAST = "Tanggal check-in tidak boleh tanggal lampau";
    public static final String CHECK_IN_REQUIRED = "Tanggal Check-in tidak boleh kosong";
    public static final String CHECK_OUT_REQUIRED = "Tanggal Check-out tidak boleh kosong";
    public static final String HOTEL_ID_REQUIRED = "ID Hotel tidak boleh kosong";
    public static final String ROOM_TYPE_ID_REQUIRED = "ID Tipe Kamar tidak boleh kosong";
    public static final String GUEST_COUNT_REQUIRED = "Jumlah tamu tidak boleh kosong";
    public static final String GUEST_COUNT_MIN = "Jumlah tamu minimal 1";
    public static final String ORDERER_NAME_REQUIRED = "Nama pemesan tidak boleh kosong";
    public static final String ORDERER_PHONE_REQUIRED = "Nomor telepon pemesan tidak boleh kosong";
    public static final String ORDERER_EMAIL_REQUIRED = "Email pemesan tidak boleh kosong";
    public static final String EMAIL_INVALID = "Format email tidak valid";
    public static final String FOR_SELF_REQUIRED = "Status is_for_self tidak boleh kosong";

    public static final String ROOM_TYPE_INVALID_OR_UNAVAILABLE = "Tipe kamar tidak valid atau tidak tersedia";
    public static final String ROOM_TYPE_NOT_MATCH_HOTEL = "Tipe kamar tidak sesuai dengan hotel";
    public static final String GUEST_EXCEEDS_ROOM_CAPACITY = "Jumlah tamu melebihi kapasitas kamar";
    public static final String ROOM_UNAVAILABLE = "Kamar tidak tersedia";
    public static final String ROOM_FULL_ON_DATE = "Hotel %s dengan kamar %s sedang penuh pada tanggal %s sampai %s";
    public static final String ROOM_TYPE_PRICE_INVALID = "Harga tipe kamar tidak valid";

    public static final String PAYMENT_METHOD_REQUIRED = "Metode pembayaran tidak boleh kosong";
    public static final String PAYMENT_PROOF_REQUIRED = "Bukti pembayaran tidak boleh kosong";
    public static final String XENDIT_API_KEY_NOT_CONFIGURED = "API key Xendit belum dikonfigurasi";
    public static final String XENDIT_CALLBACK_TOKEN_NOT_CONFIGURED = "Callback token Xendit belum dikonfigurasi";
    public static final String XENDIT_INVOICE_CREATE_FAILED = "Gagal membuat invoice Xendit";
    public static final String XENDIT_WEBHOOK_INVALID = "Payload webhook Xendit tidak valid";
    public static final String XENDIT_CALLBACK_TOKEN_INVALID = "Callback token Xendit tidak valid";

    public static final String FILE_SAVE_FAILED = "Gagal menyimpan file";
    public static final String IMAGE_FILE_EMPTY = "File gambar tidak boleh kosong";
    public static final String IMAGE_FILE_MAX_SIZE = "Ukuran file maksimal 5MB";
    public static final String IMAGE_FILE_INVALID_FORMAT = "Format gambar harus JPG, PNG, atau WEBP";
}
