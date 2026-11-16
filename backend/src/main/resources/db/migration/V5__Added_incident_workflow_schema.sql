ALTER TABLE incidents
    MODIFY category VARCHAR(50) NULL,
    MODIFY description TEXT NULL,
    MODIFY priority VARCHAR(50) NULL;

ALTER TABLE incidents
    DROP COLUMN priority_score;

UPDATE incidents SET status = 'PENDING_REVIEW' WHERE status = 'EVALUATED';
UPDATE incidents SET status = 'RESOLVED' WHERE status IN ('VERIFIED', 'CLOSED');

ALTER TABLE incidents
    ADD COLUMN photo_path VARCHAR(500) NULL,
    ADD COLUMN inspected_by BIGINT UNSIGNED NULL,
    ADD COLUMN inspected_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN asset_functional BOOLEAN NULL,
    ADD COLUMN reviewed_by BIGINT UNSIGNED NULL,
    ADD COLUMN reviewed_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN assigned_at TIMESTAMP NULL DEFAULT NULL,
    ADD COLUMN rejection_reason VARCHAR(500) NULL,
    ADD CONSTRAINT fk_incidents_inspected_by
        FOREIGN KEY (inspected_by) REFERENCES users (id)
            ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT fk_incidents_reviewed_by
        FOREIGN KEY (reviewed_by) REFERENCES users (id)
            ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX idx_incidents_status_priority_approved
    ON incidents (status, priority, approved_at);

ALTER TABLE user_profiles
    ADD COLUMN available BOOLEAN NULL,
    ADD COLUMN last_assigned_at TIMESTAMP NULL DEFAULT NULL;

CREATE TABLE worker_specialties (
    user_id BIGINT UNSIGNED NOT NULL,
    specialty VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, specialty),
    KEY idx_worker_specialties_specialty (specialty),
    CONSTRAINT fk_worker_specialties_user
        FOREIGN KEY (user_id) REFERENCES users (id)
            ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE incident_status_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    incident_id BIGINT UNSIGNED NOT NULL,
    from_status VARCHAR(100) NULL,
    to_status VARCHAR(100) NOT NULL,
    changed_by BIGINT UNSIGNED NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_incident_status_history_incident (incident_id, changed_at),
    CONSTRAINT fk_incident_status_history_incident
        FOREIGN KEY (incident_id) REFERENCES incidents (id)
            ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_incident_status_history_changed_by
        FOREIGN KEY (changed_by) REFERENCES users (id)
            ON DELETE RESTRICT ON UPDATE CASCADE
);
