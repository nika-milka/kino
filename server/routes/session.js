// routes/session.js
const express = require('express');
const { Pool } = require('pg');  // Make sure to import Pool

const router = express.Router(); // Create an Express router

// Assuming you have already set up your database connection (Pool) in server.js
// and that you're passing that pool to this module

module.exports = (pool) => { // Export a function that takes the database pool as an argument

    // API для получения жанров
    router.get('/api/genres', async (req, res) => {
        try {
            const result = await pool.query('SELECT genre_id, name FROM genres');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении жанров' });
        }
    });

    // API для получения фильмов
    router.get('/api/movies', async (req, res) => {
        try {
            const result = await pool.query('SELECT movie_id, title FROM movies');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении фильмов' });
        }
    });

    // API для получения кинотеатров
    router.get('/api/cinemas', async (req, res) => {
        try {
            const result = await pool.query('SELECT cinema_id, name FROM cinemas');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении кинотеатров' });
        }
    });

    // API для получения залов
    router.get('/api/halls', async (req, res) => {
        try {
            const result = await pool.query('SELECT hall_id, hall_name FROM halls');
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении залов' });
        }
    });

    // API для получения сеансов, сгруппированных по кинотеатру
    router.get('/api/sessions/:cinemaId', async (req, res) => {
    try {
        const { cinemaId } = req.params;
        console.log("Received cinemaId:", cinemaId);
        const result = await pool.query(`
            SELECT
                m.movie_id,
                m.title AS movie_title,
                m.duration,
                m.poster_url,
                g.name AS genre_name,
                s.session_id,
                s.start_time,
                s.end_time,
                s.price,
                h.hall_code,
                ht.type_name AS hall_type_name,
                h.seats,
                m.age_restriction,
                m.trailer_url   -- Ensure you are selecting trailer_url
            FROM sessions s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN genres g ON m.genre_id = g.genre_id
            JOIN halls h ON s.hall_id = h.hall_id
            LEFT JOIN hall_types ht ON h.type_id = ht.type_id
            WHERE h.cinema_id = $1
            ORDER BY m.title, s.start_time
        `, [cinemaId]);

        // Group sessions by movie
        const movies = {};
        result.rows.forEach(row => {
            if (!movies[row.movie_id]) {
                movies[row.movie_id] = {
                    movie_id: row.movie_id,
                    title: row.movie_title,
                    duration: row.duration,
                    poster_url: row.poster_url,
                    genre_name: row.genre_name,
                    age_restriction: row.age_restriction,
                    trailer_url: row.trailer_url, // Ensure you are passing trailer_url
                    sessions: []
                };
            }
            movies[row.movie_id].sessions.push({
                session_id: row.session_id,
                start_time: row.start_time,
                end_time: row.end_time,
                price: row.price,
                hall_code: row.hall_code,
                hall_type_name: row.hall_type_name,
                seats: row.seats
            });
        });

        // Convert the movies object to an array
        const moviesArray = Object.values(movies);
        res.json(moviesArray);

    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

    // API для добавления сеанса
    router.post('/api/sessions', async (req, res) => {
        const { movie_id, hall_id, start_time, date, price } = req.body;

        if (!movie_id || !hall_id || !start_time || !date || !price) {
            return res.status(400).json({ message: 'Не все поля заполнены' });
        }

        try {
            const result = await pool.query(
                `INSERT INTO sessions (movie_id, hall_id, start_time, date, price)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING session_id`,
                [movie_id, hall_id, start_time, date, price]
            );
            res.status(201).json({ session_id: result.rows[0].session_id });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при добавлении сеанса' });
        }
    });

  router.post('/api/tickets', async (req, res) => {
    console.log("Received POST request to /api/tickets");
    console.log("Request body:", req.body);
    const { userId, sessionId, quantity, type } = req.body;

    if (!userId || !sessionId || !quantity || !type) {
      console.warn("Missing fields in request body");
      return res.status(400).json({ error: 'Не все поля заполнены' });
    }

    try {
      // Here you would implement your database logic to create the ticket
      // This is just a placeholder
      console.log("Creating ticket with data:", { userId, sessionId, quantity, type });
      // Send a success response
      res.status(200).json({ message: 'Бронирование успешно!' }); // JSON response
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: 'Произошла ошибка на сервере' }); // JSON response
    }
  });

    // API для удаления сеанса
    router.delete('/api/sessions/:sessionId', async (req, res) => {
        const sessionId = parseInt(req.params.sessionId);

        if (isNaN(sessionId)) {
            return res.status(400).json({ message: 'Неверный ID сеанса' });
        }

        try {
            const result = await pool.query('DELETE FROM sessions WHERE session_id = $1', [sessionId]);
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Сеанс не найден' });
            }
            res.status(204).send(); // Успешное удаление, нет контента
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при удалении сеанса' });
        }
    });

    return router;  // Return the router instance
};