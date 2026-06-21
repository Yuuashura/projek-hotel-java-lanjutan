package com.ngninep.user.service;

public interface LoginAttemptService {

    void checkAllowed(String email, String ipAddress);

    void recordFailure(String email, String ipAddress);

    void clearFailures(String email, String ipAddress);

    void cleanupExpiredAttempts();
}
