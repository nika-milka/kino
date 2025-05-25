const pool = require('../config/db');

module.exports = {
  // Получение всех залов
  async findAll() {
    const { rows } = await pool.query(`
      SELECT h.*, c.name as cinema_name, ht.type_name 
      FROM halls h
      LEFT JOIN cinemas c ON h.cinema_id = c.cinema_id
      LEFT JOIN hall_types ht ON h.type_id = ht.type_id
      ORDER BY h.hall_id
    `);
    return rows;
  },

  // Получение зала по ID
  async findById(hall_id) {
    const { rows } = await pool.query(`
      SELECT h.*, c.name as cinema_name, ht.type_name 
      FROM halls h
      LEFT JOIN cinemas c ON h.cinema_id = c.cinema_id
      LEFT JOIN hall_types ht ON h.type_id = ht.type_id
      WHERE h.hall_id = $1
    `, [hall_id]);
    return rows[0] || null;
  },

  // Создание зала
  async create({ cinema_id, hall_code, type_id, seats }) {
    const { rows } = await pool.query(
      `INSERT INTO halls (cinema_id, hall_code, type_id, seats)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cinema_id, hall_code, type_id, seats]
    );
    return rows[0];
  },

  // Обновление зала
  async update(hall_id, { cinema_id, hall_code, type_id, seats }) {
    const { rows } = await pool.query(
      `UPDATE halls
       SET cinema_id = $1, hall_code = $2, type_id = $3, seats = $4
       WHERE hall_id = $5
       RETURNING *`,
      [cinema_id, hall_code, type_id, seats, hall_id]
    );
    return rows[0] || null;
  },

  // Удаление зала
  async delete(hall_id) {
    const { rowCount } = await pool.query(
      'DELETE FROM halls WHERE hall_id = $1',
      [hall_id]
    );
    return rowCount > 0;
  },

  // Получение кинотеатров для select
  async getCinemasForSelect() {
    const { rows } = await pool.query(`
      SELECT cinema_id as id, name as label
      FROM cinemas
      ORDER BY name
    `);
    return rows;
  },

  // Получение типов залов для select
  async getHallTypesForSelect() {
    const { rows } = await pool.query(`
      SELECT type_id as id, type_name as label
      FROM hall_types
      ORDER BY type_name
    `);
    return rows;
  }
};