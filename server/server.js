require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Routes imports (Объединяем импорты роутов)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const cinemaRoutes = require('./routes/cinemas');
const hallRoutes = require('./routes/halls');
const hallTypeRoutes = require('./routes/hallTypes');
const moviesRouter = require('./routes/movies');
const genresRouter = require('./routes/genres');


// Database configuration (если необходимо для обоих серверов)
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration (объединяем списки origin)
const corsOptions = {
  origin: [
    'http://localhost:5501',
    'http://127.0.0.1:5501',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    // Добавьте origins, которые нужны moviesRouter и genresRouter
    // Например: 'http://your-movies-client.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware (Используем bodyParser вместо express.json() и express.urlencoded() для совместимости)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Дополнительные заголовки middleware (оставляем, если нужны)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Logging middleware (оставляем, если нужны)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', req.body);
  }
  next();
});


// API Routes (Объединяем роуты)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/hall-types', hallTypeRoutes);
app.use('/api/movies', moviesRouter);
app.use('/api/genres', genresRouter); // Добавляем маршруты фильмов и жанров

// Health check endpoint (оставляем, если нужен)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Serve static files in production (убедитесь, что путь до статических файлов корректен)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'));
  });
}

// Error handling middleware (оставляем, если нужен)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Test database connection and start server (используем, если db необходима)
db.query('SELECT NOW()', (err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
        process.exit(1);
    } else {
        console.log('Database connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Allowed CORS origins:', corsOptions.origin);
        });
    }
});