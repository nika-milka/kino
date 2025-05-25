const pool = require('../config/db');

class HallType {
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM hall_types ORDER BY type_id');
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query('SELECT * FROM hall_types WHERE type_id = $1', [id]);
    return rows[0];
  }

  static async create({ type_name }) {
    const { rows } = await pool.query(
      'INSERT INTO hall_types (type_name) VALUES ($1) RETURNING *',
      [type_name]
    );
    return rows[0];
  }

  static async update(id, { type_name }) {
    const { rows } = await pool.query(
      'UPDATE hall_types SET type_name = $1 WHERE type_id = $2 RETURNING *',
      [type_name, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rows: usedRows } = await pool.query(
      'SELECT 1 FROM halls WHERE type_id = $1 LIMIT 1',
      [id]
    );
    
    if (usedRows.length > 0) {
      throw new Error('Тип зала используется и не может быть удален');
    }

    const { rows } = await pool.query('DELETE FROM hall_types WHERE type_id = $1 RETURNING *', [id]);
    return rows[0];
  }
}

module.exports = HallType;