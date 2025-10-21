const pool = require('../config/database');

class AdminController {
  // POST /v1/admin/invites - Create new invite
  static async createInvite(req, res) {
    try {
      const { email, role } = req.body;
      const query = `
        INSERT INTO invites (email, role, created_at, expires_at)
        VALUES ($1, $2, NOW(), NOW() + INTERVAL '7 days')
        RETURNING id, email, role, created_at, expires_at
      `;
      const result = await pool.query(query, [email, role]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // GET /v1/admin/invites - List all invites
  static async getInvites(req, res) {
    try {
      const query = 'SELECT id, email, role, created_at, expires_at, revoked_at FROM invites ORDER BY created_at DESC';
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // PATCH /v1/admin/invites/:id/revoke - Revoke specific invite
  static async revokeInvite(req, res) {
    try {
      const { id } = req.params;
      const query = `
        UPDATE invites 
        SET revoked_at = NOW() 
        WHERE id = $1 AND revoked_at IS NULL
        RETURNING id, email, role, revoked_at
      `;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Invite not found or already revoked' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AdminController;