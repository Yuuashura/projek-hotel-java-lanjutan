-- MIGRATION: Add Xendit payment invoice fields to bookings table
-- Run manually if Hibernate ddl-auto=update is disabled.

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS xendit_invoice_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS xendit_external_id VARCHAR(150),
    ADD COLUMN IF NOT EXISTS xendit_invoice_url TEXT,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS ux_bookings_xendit_external_id
    ON bookings (xendit_external_id)
    WHERE xendit_external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_xendit_invoice_id
    ON bookings (xendit_invoice_id);
