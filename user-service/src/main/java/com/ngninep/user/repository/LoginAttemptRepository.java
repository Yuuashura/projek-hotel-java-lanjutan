package com.ngninep.user.repository;

import com.ngninep.user.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    long countByEmailAndIpAddressAndAttemptedAtAfter(
            String email,
            String ipAddress,
            LocalDateTime cutoff
    );

    long countByIpAddressAndAttemptedAtAfter(String ipAddress, LocalDateTime cutoff);

    Optional<LoginAttempt> findTopByEmailAndIpAddressAndAttemptedAtAfterOrderByAttemptedAtAsc(
            String email,
            String ipAddress,
            LocalDateTime cutoff
    );

    Optional<LoginAttempt> findTopByIpAddressAndAttemptedAtAfterOrderByAttemptedAtAsc(
            String ipAddress,
            LocalDateTime cutoff
    );

    void deleteByEmailAndIpAddress(String email, String ipAddress);

    void deleteByAttemptedAtBefore(LocalDateTime cutoff);
}
