CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_login VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255) DEFAULT '/src/images/profilesPhotos/default.png',
  role ENUM('client','operator','manager','admin') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  phone_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mark VARCHAR(100) NOT NULL,
  services TEXT NOT NULL,
  time VARCHAR(100) NOT NULL,
  slot_datetime DATETIME NULL,
  salon_id INT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS streets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS salons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  city_id INT NOT NULL,
  street_id INT NOT NULL,
  building VARCHAR(20) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  open_time TIME NOT NULL DEFAULT '09:00:00',
  close_time TIME NOT NULL DEFAULT '18:00:00',
  slot_minutes INT NOT NULL DEFAULT 60,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  FOREIGN KEY (street_id) REFERENCES streets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description VARCHAR(255) DEFAULT NULL,
  duration_min INT NOT NULL DEFAULT 60,
  price DECIMAL(8,2) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS salon_services (
  salon_id INT NOT NULL,
  service_id INT NOT NULL,
  PRIMARY KEY (salon_id, service_id),
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Operators are not bound to a salon so they can receive all Telegram help requests.
CREATE TABLE IF NOT EXISTS operators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  telegram_chat_id VARCHAR(40) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS managers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  salon_id INT NOT NULL,
  telegram_chat_id VARCHAR(40) DEFAULT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Salon and service columns are nullable to preserve existing legacy bookings.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS salon_id INT NULL,
  ADD COLUMN IF NOT EXISTS service_id INT NULL;

INSERT INTO cities (name) VALUES
  ('Northgate'), ('Willow Creek'), ('Ashford'), ('Briarwood'), ('Kestrel Bay')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO streets (city_id, name)
SELECT c.id, s.name FROM cities c
JOIN (
  SELECT 'Northgate' AS city, 'Maple Avenue' AS name
  UNION ALL SELECT 'Northgate', 'Ironworks Road'
  UNION ALL SELECT 'Willow Creek', 'Riverbend Lane'
  UNION ALL SELECT 'Willow Creek', 'Old Mill Street'
  UNION ALL SELECT 'Ashford', 'Station Approach'
  UNION ALL SELECT 'Ashford', 'Copperfield Way'
  UNION ALL SELECT 'Briarwood', 'Thornhill Drive'
  UNION ALL SELECT 'Kestrel Bay', 'Harbor View Road'
) s ON s.city = c.name
WHERE NOT EXISTS (
  SELECT 1 FROM streets st WHERE st.city_id = c.id AND st.name = s.name
);

INSERT INTO salons (name, city_id, street_id, building, phone, open_time, close_time, slot_minutes)
SELECT v.name, c.id, st.id, v.building, v.phone, v.open_time, v.close_time, 60
FROM (
  SELECT 'AutoFix Northgate Central' AS name, 'Northgate' AS city, 'Maple Avenue' AS street, '12A' AS building, '+1 555 0101' AS phone, '09:00:00' AS open_time, '18:00:00' AS close_time
  UNION ALL SELECT 'AutoFix Ironworks', 'Northgate', 'Ironworks Road', '44', '+1 555 0102', '08:00:00', '17:00:00'
  UNION ALL SELECT 'AutoFix Willow Creek', 'Willow Creek', 'Riverbend Lane', '7', '+1 555 0201', '09:00:00', '18:00:00'
  UNION ALL SELECT 'AutoFix Ashford Station', 'Ashford', 'Station Approach', '3B', '+1 555 0301', '10:00:00', '19:00:00'
  UNION ALL SELECT 'AutoFix Briarwood', 'Briarwood', 'Thornhill Drive', '21', '+1 555 0401', '09:00:00', '18:00:00'
  UNION ALL SELECT 'AutoFix Kestrel Harbor', 'Kestrel Bay', 'Harbor View Road', '1', '+1 555 0501', '08:00:00', '16:00:00'
) v
JOIN cities c ON c.name = v.city
JOIN streets st ON st.city_id = c.id AND st.name = v.street
WHERE NOT EXISTS (SELECT 1 FROM salons sa WHERE sa.name = v.name);

INSERT INTO services (name, description, duration_min, price) VALUES
  ('Oil Change', 'Engine oil and filter replacement', 60, 49.99),
  ('Brake Inspection', 'Full brake system check', 60, 29.99),
  ('Tire Rotation', 'Rotation and pressure check', 60, 19.99),
  ('Engine Diagnostics', 'Computer diagnostics of engine systems', 60, 79.99),
  ('Battery Replacement', 'Battery test and replacement', 60, 99.99),
  ('Wheel Alignment', 'Four-wheel alignment', 60, 69.99),
  ('Air Conditioning Service', 'A/C check and refrigerant refill', 60, 89.99),
  ('Full Vehicle Inspection', 'Complete multi-point inspection', 60, 119.99),
  ('Transmission Fluid Flush', 'Full transmission fluid drain, flush and refill', 60, 129.99),
  ('Cabin & Air Filter Replacement', 'Clean airflow for engine and cabin interior', 30, 34.99),
  ('Suspension & Shock Check', 'Inspection of struts, bushings and shock absorbers', 60, 59.99),
  ('Spark Plugs Replacement', 'High-performance spark plugs replacement', 60, 89.99),
  ('Brake Fluid Flush', 'Hydraulic brake fluid bleed and refill', 45, 49.99),
  ('Cooling System & Radiator Flush', 'Coolant drain, system flush and anti-freeze fill', 60, 79.99),
  ('Exhaust & Muffler Service', 'Exhaust leak detection, muffler and catalytic inspection', 60, 99.99),
  ('Windshield Wiper & Washer Service', 'Premium wiper blade set and washer nozzle adjustment', 20, 24.99)
ON DUPLICATE KEY UPDATE description = VALUES(description), price = VALUES(price);

-- Links each salon to all initial services as default catalog.
INSERT INTO salon_services (salon_id, service_id)
SELECT sa.id, se.id FROM salons sa CROSS JOIN services se
WHERE NOT EXISTS (
  SELECT 1 FROM salon_services ss WHERE ss.salon_id = sa.id AND ss.service_id = se.id
);

INSERT INTO operators (name, telegram_chat_id, active)
SELECT 'Lead Operator', '1469629138', 1
WHERE NOT EXISTS (SELECT 1 FROM operators WHERE name = 'Lead Operator');

INSERT INTO managers (name, salon_id, telegram_chat_id, active)
SELECT CONCAT('Manager of ', sa.name), sa.id, '1469629138', 1 FROM salons sa
WHERE NOT EXISTS (SELECT 1 FROM managers m WHERE m.salon_id = sa.id);
