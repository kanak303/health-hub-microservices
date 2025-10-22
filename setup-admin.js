const bcrypt = require('bcrypt');
const pool = require('./src/config/database');

async function createYourAdmin() {
  try {
    const email = 'code.kanakyadav@gmail.com';
    const password = 'admin123456';
    const name = 'Shashikant Yadav';
    const role = 'PlatformAdmin';

    // Check if admin already exists
    const existingAdmin = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingAdmin.rows.length > 0) {
      console.log('User already exists with email:', email);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert the platform admin
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, email, hashedPassword, role]
    );

    console.log('Platform admin created successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', role);

  } catch (error) {
    console.error('Error creating platform admin:', error);
  } finally {
    await pool.end();
  }
}

createYourAdmin();