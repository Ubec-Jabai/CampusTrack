CREATE TABLE notifications (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT UNSIGNED NOT NULL,
    incident_id BIGINT UNSIGNED NULL,
    notification_type VARCHAR(50) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    read_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY idx_notifications_user_created (user_id, created_at),
    KEY idx_notifications_user_read (user_id, read_at),
    KEY idx_notifications_incident (incident_id),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_incident
        FOREIGN KEY (incident_id) REFERENCES incidents (id)
            ON DELETE SET NULL ON UPDATE CASCADE
);
