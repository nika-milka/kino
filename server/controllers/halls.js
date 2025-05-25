const Hall = require('../models/hall.model');

// Получение всех залов
exports.getAllHalls = async (req, res) => {
  try {
    const halls = await Hall.findAll();
    res.json(halls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение зала по ID
exports.getHallById = async (req, res) => {
  try {
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ error: 'Зал не найден' });
    }
    res.json(hall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Создание зала
exports.createHall = async (req, res) => {
  try {
    const { cinema_id, hall_code, type_id, seats } = req.body;

    if (!cinema_id || !hall_code || !type_id || !seats) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const newHall = await Hall.create({ cinema_id, hall_code, type_id, seats });
    res.status(201).json(newHall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Обновление зала
exports.updateHall = async (req, res) => {
  try {
    const updatedHall = await Hall.update(req.params.id, req.body);
    if (!updatedHall) {
      return res.status(404).json({ error: 'Зал не найден' });
    }
    res.json(updatedHall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Удаление зала
exports.deleteHall = async (req, res) => {
  try {
    const isDeleted = await Hall.delete(req.params.id);
    if (!isDeleted) {
      return res.status(404).json({ error: 'Зал не найден' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение кинотеатров для select
exports.getCinemasForSelect = async (req, res) => {
  try {
    const cinemas = await Hall.getCinemasForSelect();
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение типов залов для select
exports.getHallTypesForSelect = async (req, res) => {
  try {
    const types = await Hall.getHallTypesForSelect();
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};