-- Business Data Tables for Dashboard APIs

-- Clinics table
CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments/Bookings table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    doctor_id INTEGER REFERENCES users(id),
    patient_id INTEGER REFERENCES users(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue/Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER REFERENCES appointments(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Sample data for testing
INSERT INTO clinics (name, address, phone) VALUES 
('Downtown Health Center', '123 Main St', '555-0101'),
('Wellness Clinic North', '456 Oak Ave', '555-0102');

-- Sample appointments (last 30 days)
INSERT INTO appointments (clinic_id, doctor_id, patient_id, appointment_date, appointment_time, status, fee) VALUES 
(1, 1, 2, CURRENT_DATE - INTERVAL '1 day', '09:00', 'completed', 150.00),
(1, 1, 2, CURRENT_DATE - INTERVAL '2 days', '10:30', 'completed', 150.00),
(1, 1, 2, CURRENT_DATE - INTERVAL '3 days', '14:00', 'completed', 200.00),
(2, 1, 2, CURRENT_DATE, '11:00', 'scheduled', 150.00);

-- Sample payments
INSERT INTO payments (appointment_id, amount, payment_status) VALUES 
(1, 150.00, 'completed'),
(2, 150.00, 'completed'),
(3, 200.00, 'completed');