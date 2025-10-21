const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'admin123456';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hash:', hash);
}

hashPassword();