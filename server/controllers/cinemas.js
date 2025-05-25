const Cinema = require('../models/cinema.model');

exports.getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.getAll();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(cinemas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.getById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ error: 'Кинотеатр не найден' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(cinema);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCinema = async (req, res) => {
  try {
    const newCinema = await Cinema.create(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json(newCinema);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCinema = async (req, res) => {
  try {
    const updatedCinema = await Cinema.update(req.params.id, req.body);
    if (!updatedCinema) {
      return res.status(404).json({ error: 'Кинотеатр не найден' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(updatedCinema);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCinema = async (req, res) => {
  try {
    const deletedCinema = await Cinema.delete(req.params.id);
    if (!deletedCinema) {
      return res.status(404).json({ error: 'Кинотеатр не найден' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ message: 'Кинотеатр успешно удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};