const HallType = require('../models/hallType.model');

exports.getAllHallTypes = async (req, res) => {
  try {
    const hallTypes = await HallType.getAll();
    res.json(hallTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHallTypeById = async (req, res) => {
  try {
    const hallType = await HallType.getById(req.params.id);
    if (!hallType) {
      return res.status(404).json({ error: 'Тип зала не найден' });
    }
    res.json(hallType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createHallType = async (req, res) => {
  try {
    const newHallType = await HallType.create(req.body);
    res.status(201).json(newHallType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateHallType = async (req, res) => {
  try {
    const updatedHallType = await HallType.update(req.params.id, req.body);
    if (!updatedHallType) {
      return res.status(404).json({ error: 'Тип зала не найден' });
    }
    res.json(updatedHallType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteHallType = async (req, res) => {
  try {
    const deletedHallType = await HallType.delete(req.params.id);
    if (!deletedHallType) {
      return res.status(404).json({ error: 'Тип зала не найден' });
    }
    res.json({ message: 'Тип зала успешно удален' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};