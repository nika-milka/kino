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

// Database configuration (if necessary)
const db = require('./config/db');

const app = express();
const port = process.env.SERVER_PORT || 3000;

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
        'http://127.0.0.1:5503', // ADDED: Client origin
        'http://localhost:3000', // ADDED: Server origin if client requests directly
        // Add origins required by moviesRouter and genresRouter
        // e.g., 'http://your-movies-client.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Logging middleware (optional)
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
                s.session_id, 
                s.start_time, 
                s.end_time,
                s.price,
                m.movie_id,
                m.title as movie_title, 
                m.duration,
                m.age_restriction,
                g.name as genre_name,
                h.hall_id,
                h.hall_code,
                h.seats,
                ht.type_name as hall_type_name
            FROM sessions s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN genres g ON m.genre_id = g.genre_id
            JOIN halls h ON s.hall_id = h.hall_id
            LEFT JOIN hall_types ht ON h.type_id = ht.type_id
            WHERE h.cinema_id = $1
            ORDER BY s.start_time
        `, [cinemaId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sessions:', err);
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