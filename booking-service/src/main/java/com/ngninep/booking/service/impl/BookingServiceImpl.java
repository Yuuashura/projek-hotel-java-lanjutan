package com.ngninep.booking.service.impl;

import com.ngninep.booking.dto.req.BookingRequest;
import com.ngninep.booking.dto.req.PaymentRequest;
import com.ngninep.booking.dto.res.BookingResponse;
import com.ngninep.booking.dto.res.BookingStatsResponse;
import com.ngninep.booking.dto.res.PageMetadata;
import com.ngninep.booking.dto.res.PagedResult;
import com.ngninep.booking.dto.res.RoomTypeSnapshot;
import com.ngninep.booking.dto.res.WebResponse;
import com.ngninep.booking.entity.Booking;
import com.ngninep.booking.entity.BookingStatus;
import com.ngninep.booking.repository.BookingRepository;
import com.ngninep.booking.service.BookingService;
import com.ngninep.booking.util.Message;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${hotel.service.url:http://localhost:8082}")
    private String hotelServiceUrl;

    private static final List<BookingStatus> ACTIVE_STATUSES =
            Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED);
    private static final List<BookingStatus> REVENUE_STATUSES =
            Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.COMPLETED);
    private static final List<BookingStatus> HISTORY_STATUSES =
            Arrays.asList(BookingStatus.COMPLETED, BookingStatus.CANCELLED);

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .idBooking(booking.getIdBooking())
                .customerId(booking.getCustomerId())
                .hotelId(booking.getHotelId())
                .roomTypeId(booking.getRoomTypeId())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .numberOfGuest(booking.getNumberOfGuest())
                .totalPrice(booking.getTotalPrice())
                .ordererName(booking.getOrdererName())
                .ordererPhone(booking.getOrdererPhone())
                .ordererEmail(booking.getOrdererEmail())
                .forSelf(booking.isForSelf())
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .paymentMethod(booking.getPaymentMethod())
                .paymentProof(booking.getPaymentProof())
                .createdAt(booking.getCreatedAt())
                .paymentDeadline(booking.getPaymentDeadline())
                .build();
    }

    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, int customerId) {
        validateBookingDates(request);
        RoomTypeSnapshot roomType = fetchRoomType(request.getRoomTypeId());
        validateRoomType(request, roomType);
        Long totalPrice = calculateTotalPrice(request, roomType);

        Booking booking = Booking.builder()
                .customerId(customerId)
                .hotelId(request.getHotelId())
                .roomTypeId(request.getRoomTypeId())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .numberOfGuest(request.getNumberOfGuest())
                .totalPrice(totalPrice)
                .ordererName(request.getOrdererName())
                .ordererPhone(request.getOrdererPhone())
                .ordererEmail(request.getOrdererEmail())
                .forSelf(request.getIsForSelf() != null ? request.getIsForSelf() : true)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .paymentDeadline(LocalDateTime.now().plusHours(24))
                .build();
        
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public PagedResult<BookingResponse> getMyBookings(int customerId, String statusFilter, Integer page, Integer size) {
        expirePendingBookings();
        List<Booking> bookings;
        Pageable pageable = toPageable(page, size);
        if ("active".equalsIgnoreCase(statusFilter)) {
            if (pageable != null) {
                return mapPage(bookingRepository.findByCustomerIdAndStatusIn(customerId, ACTIVE_STATUSES, pageable));
            }
            bookings = bookingRepository.findByCustomerIdAndStatusIn(customerId, ACTIVE_STATUSES);
        } else if ("history".equalsIgnoreCase(statusFilter)) {
            if (pageable != null) {
                return mapPage(bookingRepository.findByCustomerIdAndStatusIn(customerId, HISTORY_STATUSES, pageable));
            }
            bookings = bookingRepository.findByCustomerIdAndStatusIn(customerId, HISTORY_STATUSES);
        } else {
            if (pageable != null) {
                return mapPage(bookingRepository.findByCustomerId(customerId, pageable));
            }
            bookings = bookingRepository.findByCustomerId(customerId);
        }
        return mapList(bookings);
    }

    @Override
    @Transactional
    public PagedResult<BookingResponse> getAllBookings(Integer page, Integer size) {
        expirePendingBookings();
        Pageable pageable = toPageable(page, size);
        if (pageable != null) {
            return mapPage(bookingRepository.findAll(pageable));
        }
        return mapList(bookingRepository.findAll());
    }

    @Override
    @Transactional
    public PagedResult<BookingResponse> getBookingsByHotel(int hotelId, Integer page, Integer size) {
        expirePendingBookings();
        Pageable pageable = toPageable(page, size);
        if (pageable != null) {
            return mapPage(bookingRepository.findByHotelId(hotelId, pageable));
        }
        return mapList(bookingRepository.findByHotelId(hotelId));
    }

    private Booking getBookingEntityById(int id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, Message.BOOKING_NOT_FOUND));
    }

    @Override
    @Transactional
    public BookingResponse getBookingById(int id) {
        expirePendingBookings();
        return mapToResponse(getBookingEntityById(id));
    }

    @Override
    @Transactional
    public BookingResponse payBooking(int id, PaymentRequest request, int customerId) {
        expirePendingBookings();
        Booking booking = getBookingEntityById(id);
        
        if (booking.getCustomerId() != customerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, Message.BOOKING_ACCESS_DENIED);
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.BOOKING_ALREADY_PROCESSED);
        }

        if (booking.getPaymentDeadline() != null && LocalDateTime.now().isAfter(booking.getPaymentDeadline())) {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            throw new ResponseStatusException(HttpStatus.GONE, Message.BOOKING_PAYMENT_DEADLINE_PASSED);
        }
        
        booking.setPaymentMethod(request.getPaymentMethod());
        booking.setPaymentProof(request.getPaymentProof());
        
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse updateStatus(int id, BookingStatus status) {
        expirePendingBookings();
        Booking booking = getBookingEntityById(id);
        validateStatusTransition(booking.getStatus(), status);
        booking.setStatus(status);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(int id, int customerId) {
        expirePendingBookings();
        Booking booking = getBookingEntityById(id);
        
        if (booking.getCustomerId() != customerId) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, Message.BOOKING_ACCESS_DENIED);
        }
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.BOOKING_ONLY_PENDING_CAN_BE_CANCELLED);
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public void deleteBooking(int id) {
        Booking booking = getBookingEntityById(id);
        bookingRepository.delete(booking);
    }

    @Override
    @Transactional
    public BookingStatsResponse getDashboardStats() {
        expirePendingBookings();

        long pending = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmed = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long cancelled = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        long completed = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        Long revenue = bookingRepository.sumTotalPriceByStatusIn(REVENUE_STATUSES);

        return BookingStatsResponse.builder()
                .totalBookings(bookingRepository.count())
                .pendingBookings(pending)
                .confirmedBookings(confirmed)
                .cancelledBookings(cancelled)
                .completedBookings(completed)
                .activeBookings(bookingRepository.countByStatusIn(ACTIVE_STATUSES))
                .totalRevenue(revenue != null ? revenue : 0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream downloadExcel() throws Exception {
        String[] headers = {
                "ID Booking",
                "Customer ID",
                "Hotel ID",
                "Nama Hotel",
                "Room Type ID",
                "Tipe Kamar",
                "Check-In",
                "Check-Out",
                "Jumlah Malam",
                "Jumlah Tamu",
                "Total Harga",
                "Nama Pemesan",
                "Telepon Pemesan",
                "Email Pemesan",
                "Untuk Diri Sendiri",
                "Status",
                "Metode Bayar",
                "Bukti Bayar",
                "Dibuat Pada",
                "Batas Bayar"
        };

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Data Pemesanan");
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                headerRow.createCell(i).setCellValue(headers[i]);
                headerRow.getCell(i).setCellStyle(headerStyle);
            }

            Map<Integer, String> hotelNameCache = new HashMap<>();
            Map<Integer, String> roomTypeNameCache = new HashMap<>();
            List<Booking> bookings = bookingRepository.findAll().stream()
                    .sorted(Comparator.comparingInt(Booking::getIdBooking))
                    .collect(Collectors.toList());

            int rowIndex = 1;
            for (Booking booking : bookings) {
                Row row = sheet.createRow(rowIndex++);
                long nights = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
                row.createCell(0).setCellValue(booking.getIdBooking());
                row.createCell(1).setCellValue(booking.getCustomerId());
                row.createCell(2).setCellValue(booking.getHotelId());
                row.createCell(3).setCellValue(getHotelName(booking.getHotelId(), hotelNameCache));
                row.createCell(4).setCellValue(booking.getRoomTypeId());
                row.createCell(5).setCellValue(getRoomTypeName(booking.getRoomTypeId(), roomTypeNameCache));
                row.createCell(6).setCellValue(booking.getCheckIn() != null ? booking.getCheckIn().toString() : "");
                row.createCell(7).setCellValue(booking.getCheckOut() != null ? booking.getCheckOut().toString() : "");
                row.createCell(8).setCellValue(nights);
                row.createCell(9).setCellValue(booking.getNumberOfGuest());
                row.createCell(10).setCellValue(booking.getTotalPrice() != null ? booking.getTotalPrice() : 0);
                row.createCell(11).setCellValue(safeString(booking.getOrdererName()));
                row.createCell(12).setCellValue(safeString(booking.getOrdererPhone()));
                row.createCell(13).setCellValue(safeString(booking.getOrdererEmail()));
                row.createCell(14).setCellValue(booking.isForSelf() ? "Ya" : "Tidak");
                row.createCell(15).setCellValue(booking.getStatus() != null ? booking.getStatus().name() : "");
                row.createCell(16).setCellValue(safeString(booking.getPaymentMethod()));
                row.createCell(17).setCellValue(safeString(booking.getPaymentProof()));
                row.createCell(18).setCellValue(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : "");
                row.createCell(19).setCellValue(booking.getPaymentDeadline() != null ? booking.getPaymentDeadline().toString() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        }
    }

    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void expirePendingBookings() {
        List<Booking> expiredBookings = bookingRepository.findByStatusAndPaymentDeadlineBefore(
                BookingStatus.PENDING,
                LocalDateTime.now()
        );
        if (expiredBookings.isEmpty()) {
            return;
        }

        expiredBookings.forEach(booking -> booking.setStatus(BookingStatus.CANCELLED));
        bookingRepository.saveAll(expiredBookings);
    }

    private void validateBookingDates(BookingRequest request) {
        if (!request.getCheckOut().isAfter(request.getCheckIn())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.CHECK_OUT_AFTER_CHECK_IN);
        }

        if (request.getCheckIn().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.CHECK_IN_NOT_IN_PAST);
        }
    }

    private RoomTypeSnapshot fetchRoomType(int roomTypeId) {
        try {
            String baseUrl = hotelServiceUrl != null ? hotelServiceUrl.replaceAll("/+$", "") : "http://localhost:8082";
            ResponseEntity<WebResponse<RoomTypeSnapshot>> response = restTemplate.exchange(
                    baseUrl + "/api/room-types/" + roomTypeId,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {
                    }
            );

            WebResponse<RoomTypeSnapshot> body = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful() || body == null || body.getData() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.ROOM_TYPE_INVALID_OR_UNAVAILABLE);
            }

            return body.getData();
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.ROOM_TYPE_INVALID_OR_UNAVAILABLE);
        }
    }

    private String getHotelName(int hotelId, Map<Integer, String> cache) {
        if (cache.containsKey(hotelId)) {
            return cache.get(hotelId);
        }

        String fallback = "Hotel #" + hotelId;
        try {
            String baseUrl = hotelServiceUrl != null ? hotelServiceUrl.replaceAll("/+$", "") : "http://localhost:8082";
            ResponseEntity<WebResponse<Map<String, Object>>> response = restTemplate.exchange(
                    baseUrl + "/api/hotels/" + hotelId,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<>() {
                    }
            );

            WebResponse<Map<String, Object>> body = response.getBody();
            Object name = body != null && body.getData() != null ? body.getData().get("name") : null;
            String hotelName = name instanceof String && !((String) name).isBlank() ? (String) name : fallback;
            cache.put(hotelId, hotelName);
            return hotelName;
        } catch (RestClientException ex) {
            cache.put(hotelId, fallback);
            return fallback;
        }
    }

    private String getRoomTypeName(int roomTypeId, Map<Integer, String> cache) {
        if (cache.containsKey(roomTypeId)) {
            return cache.get(roomTypeId);
        }

        String fallback = "Tipe Kamar #" + roomTypeId;
        try {
            RoomTypeSnapshot roomType = fetchRoomType(roomTypeId);
            String roomTypeName = roomType.getName() != null && !roomType.getName().isBlank() ? roomType.getName() : fallback;
            cache.put(roomTypeId, roomTypeName);
            return roomTypeName;
        } catch (ResponseStatusException ex) {
            cache.put(roomTypeId, fallback);
            return fallback;
        }
    }

    private void validateRoomType(BookingRequest request, RoomTypeSnapshot roomType) {
        if (roomType.getHotelId() != request.getHotelId()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.ROOM_TYPE_NOT_MATCH_HOTEL);
        }

        if (request.getNumberOfGuest() > roomType.getMaxGuest()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.GUEST_EXCEEDS_ROOM_CAPACITY);
        }

        if (roomType.getRoomAvailable() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.ROOM_UNAVAILABLE);
        }

        long bookedRooms = bookingRepository.countByRoomTypeIdAndStatusInAndCheckInLessThanAndCheckOutGreaterThan(
                request.getRoomTypeId(),
                ACTIVE_STATUSES,
                request.getCheckOut(),
                request.getCheckIn()
        );

        if (bookedRooms >= roomType.getRoomAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.ROOM_FULL_ON_DATE);
        }
    }

    private Long calculateTotalPrice(BookingRequest request, RoomTypeSnapshot roomType) {
        if (roomType.getPricePerNight() == null || roomType.getPricePerNight() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, Message.ROOM_TYPE_PRICE_INVALID);
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        return roomType.getPricePerNight() * nights;
    }

    private void validateStatusTransition(BookingStatus currentStatus, BookingStatus nextStatus) {
        if (currentStatus == nextStatus) {
            return;
        }

        if (currentStatus == BookingStatus.CANCELLED || currentStatus == BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format(Message.BOOKING_STATUS_CANNOT_BE_CHANGED, currentStatus));
        }

        if (currentStatus == BookingStatus.PENDING &&
                nextStatus != BookingStatus.CONFIRMED &&
                nextStatus != BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    Message.BOOKING_PENDING_TRANSITION_ONLY);
        }

        if (currentStatus == BookingStatus.CONFIRMED &&
                nextStatus != BookingStatus.COMPLETED &&
                nextStatus != BookingStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    Message.BOOKING_CONFIRMED_TRANSITION_ONLY);
        }
    }

    private Pageable toPageable(Integer page, Integer size) {
        if (page == null && size == null) {
            return null;
        }

        int safePage = page != null && page >= 0 ? page : 0;
        int safeSize = size != null && size > 0 ? Math.min(size, 100) : 10;
        return PageRequest.of(safePage, safeSize);
    }

    private PagedResult<BookingResponse> mapPage(Page<Booking> page) {
        List<BookingResponse> data = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResult.<BookingResponse>builder()
                .data(data)
                .pagination(PageMetadata.builder()
                        .currentPage(page.getNumber())
                        .pageSize(page.getSize())
                        .totalItems(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .hasNext(page.hasNext())
                        .hasPrevious(page.hasPrevious())
                        .build())
                .build();
    }

    private PagedResult<BookingResponse> mapList(List<Booking> bookings) {
        List<BookingResponse> data = bookings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResult.<BookingResponse>builder()
                .data(data)
                .pagination(PageMetadata.builder()
                        .currentPage(0)
                        .pageSize(data.size())
                        .totalItems(data.size())
                        .totalPages(data.isEmpty() ? 0 : 1)
                        .hasNext(false)
                        .hasPrevious(false)
                        .build())
                .build();
    }

    private String safeString(String value) {
        return value != null ? value : "";
    }
}
