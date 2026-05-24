package com.ngninep.booking.dto.res;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingStatsResponse {

    @JsonProperty("total_bookings")
    private long totalBookings;

    @JsonProperty("pending_bookings")
    private long pendingBookings;

    @JsonProperty("confirmed_bookings")
    private long confirmedBookings;

    @JsonProperty("cancelled_bookings")
    private long cancelledBookings;

    @JsonProperty("completed_bookings")
    private long completedBookings;

    @JsonProperty("active_bookings")
    private long activeBookings;

    @JsonProperty("total_revenue")
    private long totalRevenue;
}
