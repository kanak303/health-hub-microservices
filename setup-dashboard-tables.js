import pool from './src/config/database.js';

async function setupTables() {
  try {
    console.log('Creating dashboard tables...');
    
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clinics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        admin_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
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
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash',
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add sample data
    await pool.query(`
      INSERT INTO clinics (name, address, phone) VALUES 
      ('Downtown Health Center', '123 Main St', '555-0101'),
      ('Wellness Clinic North', '456 Oak Ave', '555-0102')
      ON CONFLICT DO NOTHING
    `);
    
    await pool.query(`
      INSERT INTO appointments (clinic_id, doctor_id, patient_id, appointment_date, appointment_time, status, fee) VALUES 
      (1, 6, 6, CURRENT_DATE - INTERVAL '1 day', '09:00', 'completed', 150.00),
      (1, 6, 6, CURRENT_DATE - INTERVAL '2 days', '10:30', 'completed', 150.00),
      (1, 6, 6, CURRENT_DATE - INTERVAL '3 days', '14:00', 'completed', 200.00),
      (2, 6, 6, CURRENT_DATE, '11:00', 'scheduled', 150.00)
      ON CONFLICT DO NOTHING
    `);
    
    await pool.query(`
      INSERT INTO payments (appointment_id, amount, payment_status) VALUES 
      (1, 150.00, 'completed'),
      (2, 150.00, 'completed'),
      (3, 200.00, 'completed')
      ON CONFLICT DO NOTHING
    `);
    
    console.log(' Dashboard tables created successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error(' Error creating tables:', error.message);
    process.exit(1);
  }
}

setupTables();