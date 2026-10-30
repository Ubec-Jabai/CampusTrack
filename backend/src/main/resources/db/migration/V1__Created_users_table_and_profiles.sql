CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20) NULL,
    phone VARCHAR(20) NULL,
    student_number VARCHAR(50) NULL,
    department VARCHAR(100) NULL,
    avatar_path VARCHAR(500) NULL,
    PRIMARY KEY (user_id),
    UNIQUE KEY uq_user_profiles_student_number (student_number),
    KEY idx_user_profiles_last_first (last_name, first_name),
    CONSTRAINT fk_user_profiles_user
        FOREIGN KEY (user_id) REFERENCES users (id)
           ON DELETE CASCADE ON UPDATE CASCADE
);