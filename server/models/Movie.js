const pool = require('../config/db');

class Movie {
    static async getAll() {
        const { rows } = await pool.query('SELECT * FROM movies');
        return rows;
    }

    static async getById(id) {
        const { rows } = await pool.query('SELECT * FROM movies WHERE movie_id = $1', [id]);
        return rows[0];
    }

    static async create({ title, director, genre_id, duration, release_year, age_restriction, description, poster_url, trailer_url }) {
        const { rows } = await pool.query(
            'INSERT INTO movies (title, director, genre_id, duration, release_year, age_restriction, description, poster_url, trailer_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [title, director, genre_id, duration, release_year, age_restriction, description, poster_url, trailer_url]
        );
        return rows[0];
    }

    static async update(id, { title, director, genre_id, duration, release_year, age_restriction, description, poster_url, trailer_url }) {
        const { rows } = await pool.query(
            'UPDATE movies SET title = $1, director = $2, genre_id = $3, duration = $4, release_year = $5, age_restriction = $6, description = $7, poster_url = $8, trailer_url = $9 WHERE movie_id = $10 RETURNING *',
            [title, director, genre_id, duration, release_year, age_restriction, description, poster_url, trailer_url, id]
        );
        return rows[0];
    }

    static async delete(id) {
        const { rows } = await pool.query('DELETE FROM movies WHERE movie_id = $1 RETURNING *', [id]);
        return rows[0];
    }

    static async getByGenre(genre_id) {
        const { rows } = await pool.query('SELECT * FROM movies WHERE genre_id = $1', [genre_id]);
        return rows;
    }
}

module.exports = Movie;