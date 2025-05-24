const express = require('express');
const { authenticateJWT, checkRole } = require('../middlewares/auth');
const db = require('../config/db');

const router = express.Router();

// Получение информации о текущем пользователе
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await db.query(
      `SELECT u.user_id, u.username, u.email, r.name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = $1`,
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});



module.exports = router;