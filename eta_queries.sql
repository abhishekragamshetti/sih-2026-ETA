USE indianrailways;

-- 1. Latest live status of a train
SELECT
    t.train_number,
    t.train_name,
    ls.current_section_id,
    ls.current_delay_minutes,
    ls.current_speed_kmph,
    ls.latitude,
    ls.longitude,
    ls.status_time
FROM livestatus ls
JOIN train t
    ON ls.train_id = t.train_id
WHERE t.train_number = '12701'
ORDER BY ls.status_time DESC
LIMIT 1;


-- 2. Average historical delay for a train and section
SELECT
    train_id,
    section_id,
    ROUND(AVG(delay_minutes), 2) AS avg_delay_minutes
FROM historicdelays
WHERE train_id = 1
  AND section_id = 2
GROUP BY train_id, section_id;


-- 3. ETA feature extraction for backend / ML model
SELECT
    t.train_number,
    t.train_name,
    ls.current_section_id AS section_id,
    s.distance_km,
    s.scheduled_time_min,
    ls.current_speed_kmph,
    ls.current_delay_minutes,
    ROUND(AVG(hd.delay_minutes), 2) AS avg_historical_delay
FROM livestatus ls
JOIN train t
    ON ls.train_id = t.train_id
JOIN section s
    ON ls.current_section_id = s.section_id
LEFT JOIN historicdelays hd
    ON ls.train_id = hd.train_id
    AND ls.current_section_id = hd.section_id
WHERE t.train_number = '12701'
AND ls.status_time = (
    SELECT MAX(ls2.status_time)
    FROM livestatus ls2
    WHERE ls2.train_id = ls.train_id
)
GROUP BY
    t.train_number,
    t.train_name,
    ls.current_section_id,
    s.distance_km,
    s.scheduled_time_min,
    ls.current_speed_kmph,
    ls.current_delay_minutes;


-- 4. Baseline ETA prediction
SELECT
    t.train_number,
    t.train_name,
    ls.current_section_id AS section_id,

    ROUND(
        (s.distance_km / NULLIF(ls.current_speed_kmph, 0)) * 60,
        2
    ) AS speed_based_time,

    ROUND(
        AVG(hd.delay_minutes),
        2
    ) AS avg_historical_delay,

    ROUND(
        ((s.distance_km / NULLIF(ls.current_speed_kmph, 0)) * 60)
        + AVG(hd.delay_minutes),
        2
    ) AS predicted_travel_minutes,

    DATE_ADD(
        ls.status_time,
        INTERVAL ROUND(
            ((s.distance_km / NULLIF(ls.current_speed_kmph, 0)) * 60)
            + AVG(hd.delay_minutes)
        ) MINUTE
    ) AS predicted_arrival_time

FROM livestatus ls
JOIN train t
    ON ls.train_id = t.train_id
JOIN section s
    ON ls.current_section_id = s.section_id
LEFT JOIN historicdelays hd
    ON ls.train_id = hd.train_id
    AND ls.current_section_id = hd.section_id
WHERE t.train_number = '12701'
AND ls.status_time = (
    SELECT MAX(ls2.status_time)
    FROM livestatus ls2
    WHERE ls2.train_id = ls.train_id
)
GROUP BY
    t.train_number,
    t.train_name,
    ls.current_section_id,
    s.distance_km,
    ls.current_speed_kmph,
    ls.status_time;