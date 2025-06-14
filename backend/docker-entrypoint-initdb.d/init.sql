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
    image_path VARCHAR(255)
);

INSERT INTO regions (name) VALUES
    ('Moscow Region'),
    ('Saint Petersburg Region'),
    ('Novosibirsk Region'),
    ('Krasnodar Region'),
    ('Sverdlovsk Region');

INSERT INTO cities (name, region_id, distance_to_moscow, population) VALUES
    ('Moscow', 1, 0.0, 12680000),
    ('Saint Petersburg', 2, 712.0, 5380000),
    ('Novosibirsk', 3, 2815.0, 1630000),
    ('Krasnodar', 4, 1234.0, 950000),
    ('Yekaterinburg', 5, 1423.0, 1490000),
    ('Khimki', 1, 20.0, 250000),
    ('Pushkin', 2, 690.0, 100000),
    ('Berdsk', 3, 2800.0, 110000),
    ('Sochi', 4, 1500.0, 400000),
    ('Nizhny Tagil', 5, 1450.0, 350000);

INSERT INTO cities (name, region_id, distance_to_moscow, population) VALUES
    ('Zelenograd', 1, 40.0, 220000),
    ('Kolpino', 2, 700.0, 150000),
    ('Ob', 3, 2820.0, 50000),
    ('Anapa', 4, 1450.0, 80000),
    ('Kamensk-Uralsky', 5, 1800.0, 170000);