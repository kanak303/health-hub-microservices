import pool from '../config/database.js';

class Invite {
  static async create(inviteData) {
    const { email, role, token, invited_by, expires_at } = inviteData;
    const query = `
      INSERT INTO invites (email, role, token, invited_by, expires_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, role, token, created_at, expires_at
    `;
    const result = await pool.query(query, [email, role, token, invited_by, expires_at]);
    return result.rows[0];
  }

  static async findByToken(token) {
    const query = 'SELECT * FROM invites WHERE token = $1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()';
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async markAsUsed(id) {
    const query = 'UPDATE invites SET used_at = NOW() WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM invites WHERE email = $1 AND used_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
}

export default Invite;