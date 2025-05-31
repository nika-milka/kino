require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

// Routes imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cinemaRoutes = require('./routes/cinemas');
const hallRoutes = require('./routes/halls');
const hallTypeRoutes = require('./routes/hallTypes');
const moviesRouter = require('./routes/movies');
const genresRouter = require('./routes/genres');
const addSessionRoutes = require('./routes/add-session');

// Database configuration (if necessary)
const db = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Database Pool Configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// CORS Configuration - Combined Origins
const corsOptions = {
    origin: [
        'http://localhost:5501',
        'http://127.0.0.1:5501',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:5503',
        'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing middleware MUST come BEFORE route handlers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../client')));

// Logging middleware (optional) - AFTER body parsing
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request body:', req.body);
    }
    next();
});

// API endpoints
app.get('/api/cinemas', async (req, res) => {
    try {
        const result = await pool.query('SELECT cinema_id, name, address, phone FROM cinemas');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching cinemas:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/sessions/:cinemaId', async (req, res) => {
    try {
        const { cinemaId } = req.params;

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
                h.seats AS total_seats,
                (h.seats - (SELECT COUNT(t.ticket_id) FROM tickets t WHERE t.session_id = s.session_id)) AS available_seats,
                m.age_restriction,
                m.trailer_url
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
                    trailer_url: row.trailer_url,
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
                total_seats: row.total_seats,
                available_seats: row.available_seats
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

// API endpoint for creating tickets
app.post('/api/tickets', async (req, res) => {
    let { userId, sessionId, quantity, type } = req.body;

    if (!userId || !sessionId || !quantity || !type) {
        return res.status(400).json({ error: 'Не все поля заполнены' });
    }

    try {
        userId = parseInt(userId, 10);
        sessionId = parseInt(sessionId, 10);
        quantity = parseInt(quantity, 10);

        console.log(`Бронирование для сессии ${sessionId}: запрашиваемое количество билетов: ${quantity}`);

        // Check if there are enough available seats
        const checkSeatsQuery = await pool.query(
            `SELECT h.seats - (SELECT COUNT(*) FROM tickets WHERE session_id = $1) AS available_seats
            FROM halls h JOIN sessions s ON h.hall_id = s.hall_id
            WHERE s.session_id = $1`,
            [sessionId]
        );

        const availableSeats = checkSeatsQuery.rows[0]?.available_seats || 0;

        if (availableSeats < quantity) {
            return res.status(400).json({ error: 'Недостаточно мест' });
        }

        // Insert the ticket
        const result = await pool.query(
            `INSERT INTO tickets (user_id, session_id, quantity, type)
             VALUES ($1, $2, $3, $4)
             RETURNING ticket_id`,
            [userId, sessionId, quantity, type]
        );

        console.log(`Билет успешно создан, ID: ${result.rows[0].ticket_id}, количество: ${quantity}, тип: ${type}`);

        res.status(201).json({ ticket_id: result.rows[0].ticket_id });
    } catch (err) {
        console.error('Error creating ticket:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/cinema.html'));
});

app.get('/session.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/session.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/hall-types', hallTypeRoutes);
app.use('/api/movies', moviesRouter);
app.use('/api/genres', genresRouter);
app.use('/', addSessionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server with database connection test
db.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
        process.exit(1);
    } else {
        console.log('Database connected');
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
            console.log('Allowed CORS origins:', corsOptions.origin);
        });
    }
});