package com.ngninep.user.service;

import com.ngninep.user.entity.LoginAttempt;
import com.ngninep.user.exception.LoginRateLimitException;
import com.ngninep.user.repository.LoginAttemptRepository;
import com.ngninep.user.service.impl.LoginAttemptServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoginAttemptServiceImplTest {

    @Mock
    private LoginAttemptRepository repository;

    private LoginAttemptServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new LoginAttemptServiceImpl(repository);
        ReflectionTestUtils.setField(service, "emailIpLimit", 10);
        ReflectionTestUtils.setField(service, "ipLimit", 30);
        ReflectionTestUtils.setField(service, "windowSeconds", 900L);
        ReflectionTestUtils.setField(service, "retentionHours", 24L);
    }

    @Test
    void blocksEmailAndIpPairAfterTenFailures() {
        String email = "user@example.com";
        String ip = "192.0.2.10";
        LocalDateTime oldest = LocalDateTime.now().minusMinutes(5);

        when(repository.countByEmailAndIpAddressAndAttemptedAtAfter(eq(email), eq(ip), any()))
                .thenReturn(10L);
        when(repository.findTopByEmailAndIpAddressAndAttemptedAtAfterOrderByAttemptedAtAsc(
                eq(email),
                eq(ip),
                any()
        )).thenReturn(Optional.of(LoginAttempt.builder().attemptedAt(oldest).build()));

        LoginRateLimitException exception = assertThrows(
                LoginRateLimitException.class,
                () -> service.checkAllowed(email, ip)
        );

        assertTrue(exception.getRetryAfterSeconds() >= 590);
        assertTrue(exception.getRetryAfterSeconds() <= 600);
    }

    @Test
    void blocksIpAfterThirtyFailuresAcrossAccounts() {
        String email = "user@example.com";
        String ip = "192.0.2.20";
        LocalDateTime oldest = LocalDateTime.now().minusMinutes(10);

        when(repository.countByEmailAndIpAddressAndAttemptedAtAfter(eq(email), eq(ip), any()))
                .thenReturn(2L);
        when(repository.countByIpAddressAndAttemptedAtAfter(eq(ip), any())).thenReturn(30L);
        when(repository.findTopByIpAddressAndAttemptedAtAfterOrderByAttemptedAtAsc(eq(ip), any()))
                .thenReturn(Optional.of(LoginAttempt.builder().attemptedAt(oldest).build()));

        LoginRateLimitException exception = assertThrows(
                LoginRateLimitException.class,
                () -> service.checkAllowed(email, ip)
        );

        assertTrue(exception.getRetryAfterSeconds() >= 290);
        assertTrue(exception.getRetryAfterSeconds() <= 300);
    }

    @Test
    void normalizesEmailWhenRecordingAndClearingFailures() {
        service.recordFailure("  USER@Example.COM ", "192.0.2.30");

        ArgumentCaptor<LoginAttempt> attemptCaptor = ArgumentCaptor.forClass(LoginAttempt.class);
        verify(repository).save(attemptCaptor.capture());
        assertEquals("user@example.com", attemptCaptor.getValue().getEmail());
        assertEquals("192.0.2.30", attemptCaptor.getValue().getIpAddress());

        service.clearFailures("  USER@Example.COM ", "192.0.2.30");
        verify(repository).deleteByEmailAndIpAddress("user@example.com", "192.0.2.30");
    }
}
