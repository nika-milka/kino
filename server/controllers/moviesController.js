const Movie = require('../models/Movie');
const Genre = require('../models/Genre');

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.getAll();
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.getById(req.params.id);
        if (!movie) {
            return res.status(404).json({ error: 'Фильм не найден' });
        }
        res.json(movie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMovie = async (req, res) => {
    try {
        const newMovie = await Movie.create(req.body);
        res.status(201).json(newMovie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.update(req.params.id, req.body);
        if (!updatedMovie) {
            return res.status(404).json({ error: 'Фильм не найден' });
        }
        res.json(updatedMovie);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        const deletedMovie = await Movie.delete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ error: 'Фильм не найден' });
        }
        res.json({ message: 'Фильм удален' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMoviesByGenre = async (req, res) => {
    try {
        const movies = await Movie.getByGenre(req.params.genre_id);
        res.json(movies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGenres = async (req, res) => {
    try {
        const genres = await Genre.getAll();
        // Сортируем жанры по алфавиту
        genres.sort((a, b) => a.name.localeCompare(b.name));
        res.json(genres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};