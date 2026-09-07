USE indianrailways;

INSERT INTO station
VALUES
(1, 'SC', 'Secunderabad Junction', 17.4399, 78.4983, 'SCR'),
(2, 'KZJ', 'Kazipet Junction', 17.9689, 79.5941, 'SCR'),
(3, 'WL', 'Warangal', 17.9784, 79.6010, 'SCR'),
(4, 'BZA', 'Vijayawada Junction', 16.5185, 80.6370, 'SCR');

INSERT INTO train
(train_id, train_number, train_name, train_type, source_station_id, destination_station_id)
VALUES
(1, '12760', 'Charminar SF Express', 'Superfast', 1, 4),
(2, '12764', 'Padmavati SF Express', 'Superfast', 1, 4),
(3, '12706', 'Guntur InterCity SF Express', 'Superfast', 1, 4),
(4, '17202', 'Golconda Express', 'Express', 1, 4),
(5, '12714', 'Satavahana SF Express', 'Superfast', 1, 4),
(6, '12728', 'Godavari SF Express', 'Superfast', 1, 4),
(7, '12806', 'Janmabhoomi SF Express', 'Superfast', 1, 4),
(8, '12710', 'Simhapuri SF Express', 'Superfast', 1, 4),
(9, '12734', 'Narayanadri SF Express', 'Superfast', 1, 4),
(10, '12738', 'Gowthami SF Express', 'Superfast', 1, 4);

INSERT INTO section
VALUES
(1, 1, 2, 140.5, 120),
(2, 2, 3, 10.5, 15),
(3, 3, 4, 210.0, 180);

INSERT INTO historicdelays
(train_id, section_id, journey_date, delay_minutes, recorded_at)
VALUES
(1, 1, '2026-08-25', 10.00, NOW()),
(1, 2, '2026-08-25', 14.00, NOW()),
(1, 3, '2026-08-25', 18.00, NOW()),

(2, 1, '2026-08-26', 15.00, NOW()),
(2, 2, '2026-08-26', 19.00, NOW()),
(2, 3, '2026-08-26', 22.00, NOW()),

(3, 1, '2026-08-27', 6.00, NOW()),
(3, 2, '2026-08-27', 9.00, NOW()),
(3, 3, '2026-08-27', 12.00, NOW()),

(4, 1, '2026-08-28', 20.00, NOW()),
(4, 2, '2026-08-28', 24.00, NOW()),
(4, 3, '2026-08-28', 29.00, NOW()),

(5, 1, '2026-08-29', 4.00, NOW()),
(5, 2, '2026-08-29', 7.00, NOW()),
(5, 3, '2026-08-29', 10.00, NOW()),

(6, 1, '2026-08-30', 16.00, NOW()),
(6, 2, '2026-08-30', 21.00, NOW()),
(6, 3, '2026-08-30', 25.00, NOW()),

(7, 1, '2026-08-31', 8.00, NOW()),
(7, 2, '2026-08-31', 11.00, NOW()),
(7, 3, '2026-08-31', 14.00, NOW()),

(8, 1, '2026-09-01', 12.00, NOW()),
(8, 2, '2026-09-01', 16.00, NOW()),
(8, 3, '2026-09-01', 20.00, NOW()),

(9, 1, '2026-09-02', 25.00, NOW()),
(9, 2, '2026-09-02', 31.00, NOW()),
(9, 3, '2026-09-02', 35.00, NOW()),

(10, 1, '2026-09-03', 5.00, NOW()),
(10, 2, '2026-09-03', 8.00, NOW()),
(10, 3, '2026-09-03', 11.00, NOW());

INSERT INTO livestatus
(
    train_id,
    current_station_id,
    next_station_id,
    current_section_id,
    current_delay_minutes,
    current_speed_kmph,
    latitude,
    longitude,
    status_time
)
VALUES
(1, 1, 2, 1, 12.00, 78.00, 17.6500000, 78.9000000, NOW()),
(2, 2, 3, 2, 18.00, 52.00, 17.9700000, 79.5900000, NOW()),
(3, 3, 4, 3, 8.00, 84.00, 17.7000000, 79.9000000, NOW()),
(4, 1, 2, 1, 25.00, 68.00, 17.7200000, 78.9800000, NOW()),
(5, 2, 3, 2, 5.00, 48.00, 17.9750000, 79.5950000, NOW()),
(6, 3, 4, 3, 20.00, 76.00, 17.4000000, 80.1000000, NOW()),
(7, 1, 2, 1, 10.00, 82.00, 17.8000000, 79.1000000, NOW()),
(8, 2, 3, 2, 15.00, 55.00, 17.9720000, 79.5970000, NOW()),
(9, 3, 4, 3, 30.00, 70.00, 17.1000000, 80.3000000, NOW()),
(10, 1, 2, 1, 7.00, 88.00, 17.6000000, 78.8500000, NOW());
