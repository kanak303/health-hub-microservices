import pool from '../config/database.js';

class Config {
  static async getAll() {
    const result = await pool.query('SELECT * FROM global_configs ORDER BY category, key');
    return result.rows;
  }

  static async getByCategory(category) {
    const result = await pool.query('SELECT * FROM global_configs WHERE category = $1', [category]);
    return result.rows;
  }

  static async getByKey(key) {
    const result = await pool.query('SELECT * FROM global_configs WHERE key = $1', [key]);
    return result.rows[0];
  }

  static async create(configData) {
    const { key, value, category, description, data_type } = configData;
    const result = await pool.query(
      'INSERT INTO global_configs (key, value, category, description, data_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [key, value, category, description, data_type]
    );
    return result.rows[0];
  }

  static async update(key, configData) {
    const { value, description } = configData;
    const result = await pool.query(
      'UPDATE global_configs SET value = $1, description = $2, updated_at = NOW() WHERE key = $3 RETURNING *',
      [value, description, key]
    );
    return result.rows[0];
  }

  static async delete(key) {
    const result = await pool.query('DELETE FROM global_configs WHERE key = $1 RETURNING *', [key]);
    return result.rows[0];
  }
}

export default Config;