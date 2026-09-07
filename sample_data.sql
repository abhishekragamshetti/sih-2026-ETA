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
(1,1,'2026-09-01',12,NOW()),
(1,1,'2026-09-02',18,NOW()),
(1,1,'2026-09-03',10,NOW()),
(1,1,'2026-09-04',15,NOW()),
(1,2,'2026-09-01',5,NOW()),
(1,2,'2026-09-02',8,NOW()),
(1,2,'2026-09-03',6,NOW()),
(1,2,'2026-09-04',9,NOW());

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
(1,2,3,2,17,72,17.9689,79.5941,NOW()),
(1,2,3,2,14,78,17.9700,79.5960,NOW());
