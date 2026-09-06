CREATE TABLE station (
    station_id INT PRIMARY KEY,
    station_code VARCHAR(30) NOT NULL UNIQUE,
    station_name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    zone VARCHAR(30)
);

CREATE TABLE train (
    train_id INT PRIMARY KEY,
    train_number VARCHAR(10) NOT NULL UNIQUE,
    train_name VARCHAR(100) NOT NULL,
    train_type VARCHAR(30),
    source_station_id INT,
    destination_station_id INT
);

CREATE TABLE section (
    section_id INT PRIMARY KEY,
    from_station_id INT NOT NULL,
    to_station_id INT NOT NULL,
    distance_km DECIMAL(8,2),
    scheduled_time_min INT,
    FOREIGN KEY (from_station_id) REFERENCES station(station_id),
    FOREIGN KEY (to_station_id) REFERENCES station(station_id)
);

CREATE TABLE historicdelays (
    delay_id INT PRIMARY KEY AUTO_INCREMENT,
    train_id INT NOT NULL,
    section_id INT NOT NULL,
    journey_date DATE NOT NULL,
    delay_minutes DECIMAL(6,2),
    recorded_at DATETIME,
    FOREIGN KEY (train_id) REFERENCES train(train_id),
    FOREIGN KEY (section_id) REFERENCES section(section_id)
);

CREATE TABLE livestatus (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    train_id INT NOT NULL,
    current_station_id INT,
    next_station_id INT,
    current_section_id INT,
    current_delay_minutes DECIMAL(6,2),
    current_speed_kmph DECIMAL(6,2),
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    status_time DATETIME,
    FOREIGN KEY (train_id) REFERENCES train(train_id),
    FOREIGN KEY (current_station_id) REFERENCES station(station_id),
    FOREIGN KEY (next_station_id) REFERENCES station(station_id),
    FOREIGN KEY (current_section_id) REFERENCES section(section_id)
);

CREATE INDEX idx_live_train_time
ON livestatus(train_id, status_time);

CREATE INDEX idx_history_train_section
ON historicdelays(train_id, section_id);

CREATE INDEX idx_section_from_to
ON section(from_station_id, to_station_id);