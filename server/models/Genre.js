const pool = require('../config/db');

class Genre {
    static async getAll() {
        const { rows } = await pool.query('SELECT * FROM genres ORDER BY name ASC');
        return rows;
    }
}

module.exports = Genre;