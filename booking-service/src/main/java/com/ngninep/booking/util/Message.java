package com.ngninep.booking.util;

public final class Message {

    private Message() {
    }

    public static final String BOOKING_NOT_FOUND = "Booking tidak ditemukan";
    public static final String BOOKING_ACCESS_DENIED = "Anda tidak memiliki akses ke booking ini";
    public static final String BOOKING_ALREADY_PROCESSED = "Booking sudah diproses atau dibatalkan";
    public static final String BOOKING_PAYMENT_DEADLINE_PASSED = "Batas waktu pembayaran sudah lewat";
    public static final String ROOM_TYPE_PRICE_INVALID = "Harga tipe kamar tidak valid";
}
