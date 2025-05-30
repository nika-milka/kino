// server/routes/add-session.js
const express = require('express');
const pool = require('../config/db');
const moment = require('moment');
const router = express.Router();
router.get('/movies', async (req, res) => {
    try {
        const {
            cinema_id,
            genre_id
        } = req.query;
        let query = `
            SELECT
                m.movie_id,
                m.title,
                m.description,
                g.name AS genre_name
            FROM
                movies m
            JOIN
                genres g ON m.genre_id = g.genre_id
        `;
        const values = [];
        if (cinema_id || genre_id) {
            query += ' WHERE ';
        }
        if (cinema_id) {
            query += `EXISTS (SELECT 1 FROM sessions s JOIN halls h ON s.hall_id = h.hall_id WHERE s.movie_id = m.movie_id AND h.cinema_id = $${values.length + 1})`;
            values.push(cinema_id);
        }
        if (cinema_id && genre_id) {
            query += ' AND ';
        }
        if (genre_id) {
            query += `m.genre_id = $${values.length + 1}`;
            values.push(genre_id);
        }
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка фильмов:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка фильмов'
        });
    }
});
router.get('/movies/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT movie_id, title FROM movies');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка фильмов для выпадающего списка:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка фильмов для выпадающего списка'
        });
    }
});
router.get('/sessions', async (req, res) => {
    try {
        const {
            movie_id
        } = req.query;
        const query = `
            SELECT
                s.session_id,
                s.movie_id,
                s.hall_id,
                s.start_time,
                s.end_time,
                s.date,
                s.price,
                c.name AS cinema_name,
                h.hall_code
            FROM
                sessions s
            JOIN
                halls h ON s.hall_id = h.hall_id
            JOIN
                cinemas c ON h.cinema_id = c.cinema_id
            WHERE
                s.movie_id = $1
        `;
        const result = await pool.query(query, [movie_id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка сеансов:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка сеансов'
        });
    }
});
router.post('/sessions', async (req, res) => {
    try {
        const {
            movie_id,
            hall_id,
            start_time,
            end_time,
            date,
            price
        } = req.body;
        // Преобразование start_time и end_time в формат, понятный для PostgreSQL (TIMESTAMP)
        const formattedStartTime = moment(start_time).format('YYYY-MM-DD HH:mm:ss');
        const formattedEndTime = moment(end_time).format('YYYY-MM-DD HH:mm:ss');
        const formattedDate = moment(date).format('YYYY-MM-DD');
        const query = `
            INSERT INTO sessions (movie_id, hall_id, start_time, end_time, date, price)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await pool.query(query, [movie_id, hall_id, formattedStartTime, formattedEndTime, formattedDate, price]);
        res.status(201).json({
            message: 'Сеанс успешно добавлен'
        });
    } catch (error) {
        console.error('Ошибка при добавлении сеанса:', error);
        res.status(500).json({
            error: 'Ошибка при добавлении сеанса'
        });
    }
});
router.get('/sessions/:session_id', async (req, res) => {
    try {
        const {
            session_id
        } = req.params;
        const query = `
            SELECT
                s.session_id,
                s.movie_id,
                s.hall_id,
                s.start_time,
                s.end_time,
                s.date,
                s.price,
                h.cinema_id
            FROM
                sessions s
            JOIN halls h ON s.hall_id = h.hall_id
            WHERE s.session_id = $1
        `;
        const result = await pool.query(query, [session_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Сеанс не найден'
            });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка при получении информации о сеансе:', error);
        res.status(500).json({
            error: 'Ошибка при получении информации о сеансе'
        });
    }
});
router.put('/sessions/:session_id', async (req, res) => {
    try {
        const {
            session_id
        } = req.params;
        const {
            movie_id,
            hall_id,
            start_time,
            end_time,
            date,
            price
        } = req.body;
        const formattedStartTime = moment(start_time).format('YYYY-MM-DD HH:mm:ss');
        const formattedEndTime = moment(end_time).format('YYYY-MM-DD HH:mm:ss');
        const formattedDate = moment(date).format('YYYY-MM-DD');
        const query = `
            UPDATE sessions
            SET movie_id = $1, hall_id = $2, start_time = $3, end_time = $4, date = $5, price = $6
            WHERE session_id = $7
        `;
        await pool.query(query, [movie_id, hall_id, formattedStartTime, formattedEndTime, formattedDate, price, session_id]);
        res.json({
            message: 'Сеанс успешно обновлен'
        });
    } catch (error) {
        console.error('Ошибка при обновлении информации о сеансе:', error);
        res.status(500).json({
            error: 'Ошибка при обновлении информации о сеансе'
        });
    }
});
router.delete('/sessions/:session_id', async (req, res) => {
    try {
        const {
            session_id
        } = req.params;
        const query = `DELETE FROM sessions WHERE session_id = $1`;
        await pool.query(query, [session_id]);
        res.json({
            message: 'Сеанс успешно удален'
        });
    } catch (error) {
        console.error('Ошибка при удалении сеанса:', error);
        res.status(500).json({
            error: 'Ошибка при удалении сеанса'
        });
    }
});
router.get('/cinemas', async (req, res) => {
    try {
        const result = await pool.query('SELECT cinema_id, name FROM cinemas');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка кинотеатров:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка кинотеатров'
        });
    }
});
router.get('/halls', async (req, res) => {
    try {
        const {
            cinema_id
        } = req.query;
        const query = 'SELECT hall_id, hall_code FROM halls WHERE cinema_id = $1';
        const result = await pool.query(query, [cinema_id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка залов:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка залов'
        });
    }
});
router.get('/genres', async (req, res) => {
    try {
        const result = await pool.query('SELECT genre_id, name FROM genres');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении списка жанров:', error);
        res.status(500).json({
            error: 'Ошибка при получении списка жанров'
        });
    }
});
module.exports = router;