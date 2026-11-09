ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS salon_id INT NULL,
  ADD COLUMN IF NOT EXISTS service_id INT NULL,
  ADD COLUMN IF NOT EXISTS slot_datetime DATETIME NULL;

CREATE TABLE IF NOT EXISTS operator_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_login VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE users
  MODIFY COLUMN role ENUM('client','operator','manager','admin') NOT NULL DEFAULT 'client';

INSERT INTO managers (name, salon_id, telegram_chat_id, active)
SELECT CONCAT('Manager of ', sa.name), sa.id, '1469629138', 1
FROM salons sa
WHERE NOT EXISTS (SELECT 1 FROM managers m WHERE m.salon_id = sa.id);

INSERT INTO services (name, description, duration_min, price) VALUES
  ('Transmission Fluid Flush', 'Full transmission fluid drain, flush and refill', 60, 129.99),
  ('Cabin & Air Filter Replacement', 'Clean airflow for engine and cabin interior', 30, 34.99),
  ('Suspension & Shock Check', 'Inspection of struts, bushings and shock absorbers', 60, 59.99),
  ('Spark Plugs Replacement', 'High-performance spark plugs replacement', 60, 89.99),
  ('Brake Fluid Flush', 'Hydraulic brake fluid bleed and refill', 45, 49.99),
  ('Cooling System & Radiator Flush', 'Coolant drain, system flush and anti-freeze fill', 60, 79.99),
  ('Exhaust & Muffler Service', 'Exhaust leak detection, muffler and catalytic inspection', 60, 99.99),
  ('Windshield Wiper & Washer Service', 'Premium wiper blade set and washer nozzle adjustment', 20, 24.99)
ON DUPLICATE KEY UPDATE description = VALUES(description), price = VALUES(price);

INSERT INTO salon_services (salon_id, service_id)
SELECT sa.id, se.id FROM salons sa CROSS JOIN services se
WHERE NOT EXISTS (
  SELECT 1 FROM salon_services ss WHERE ss.salon_id = sa.id AND ss.service_id = se.id
);

DELETE FROM operators WHERE id > 1;
UPDATE operators SET name = 'Lead Operator', telegram_chat_id = '1469629138', active = 1 WHERE id = 1;
INSERT INTO operators (name, telegram_chat_id, active)
SELECT 'Lead Operator', '1469629138', 1
WHERE NOT EXISTS (SELECT 1 FROM operators);

UPDATE managers SET telegram_chat_id = '1469629138' WHERE telegram_chat_id IS NULL;

