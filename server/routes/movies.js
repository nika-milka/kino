const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');

router.get('/', moviesController.getAllMovies);
router.get('/:id', moviesController.getMovieById);
router.post('/', moviesController.createMovie);
router.put('/:id', moviesController.updateMovie);
router.delete('/:id', moviesController.deleteMovie);
router.get('/genre/:genre_id', moviesController.getMoviesByGenre);

module.exports = router;