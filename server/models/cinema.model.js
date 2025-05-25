const pool = require('../config/db');

class Cinema {
  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM cinemas ORDER BY cinema_id');
    return rows;
  }

  static async getById(id) {
    const { rows } = await pool.query('SELECT * FROM cinemas WHERE cinema_id = $1', [id]);
    return rows[0];
  }

  static async create({ name, address, phone }) {
    const { rows } = await pool.query(
      'INSERT INTO cinemas (name, address, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, address, phone]
    );
    return rows[0];
  }

  static async update(id, { name, address, phone }) {
    const { rows } = await pool.query(
      'UPDATE cinemas SET name = $1, address = $2, phone = $3 WHERE cinema_id = $4 RETURNING *',
      [name, address, phone, id]
    );
    return rows[0];
  }

  static async delete(id) {
    const { rows } = await pool.query('DELETE FROM cinemas WHERE cinema_id = $1 RETURNING *', [id]);
    return rows[0];
  }
}

module.exports = Cinema;