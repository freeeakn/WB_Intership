CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region_id INT NOT NULL REFERENCES regions(id),
    distance_to_moscow FLOAT NOT NULL,
    population BIGINT NOT NULL,
    image_path VARCHAR(255),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL
);

INSERT INTO regions (name) VALUES
    ('Московская область'),
    ('Ленинградская область'),
    ('Новосибирская область'),
    ('Краснодарский край'),
    ('Свердловская область');

INSERT INTO cities (name, region_id, distance_to_moscow, population, latitude, longitude) VALUES
    ('Москва', 1, 0.0, 12680000, 55.7558, 37.6173),
    ('Санкт-Петербург', 2, 712.0, 5380000, 59.9343, 30.3351),
    ('Новосибирск', 3, 2815.0, 1630000, 55.0084, 82.9357),
    ('Краснодар', 4, 1234.0, 950000, 45.0355, 38.9753),
    ('Екатеринбург', 5, 1423.0, 1490000, 56.8389, 60.6057),
    ('Химки', 1, 20.0, 250000, 55.8970, 37.4298),
    ('Пушкин', 2, 690.0, 100000, 59.7142, 30.3964),
    ('Бердск', 3, 2800.0, 110000, 54.7597, 83.0976),
    ('Сочи', 4, 1500.0, 400000, 43.5855, 39.7231),
    ('Нижний Тагил', 5, 1450.0, 350000, 57.9192, 59.9655);

INSERT INTO cities (name, region_id, distance_to_moscow, population, latitude, longitude) VALUES
    ('Зеленоград', 1, 40.0, 220000, 55.9833, 37.1833),
    ('Колпино', 2, 700.0, 150000, 59.7500, 30.5833),
    ('Обь', 3, 2820.0, 50000, 54.9864, 82.7037),
    ('Анапа', 4, 1450.0, 80000, 44.8938, 37.3164),
    ('Каменск-Уральский', 5, 1800.0, 170000, 56.4172, 61.9339);