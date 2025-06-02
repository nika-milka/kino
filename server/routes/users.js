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

// Обновление роли пользователя (доступно только администратору)
router.put('/:id/role', authenticateJWT, checkRole(['system']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Проверяем, что роль валидна
    const validRoles = ['user', 'manager', 'system'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Неверная роль пользователя' });
    }

    // Находим ID новой роли
    const roleData = await db.query(
      'SELECT role_id FROM roles WHERE name = $1',
      [role]
    );

    if (roleData.rows.length === 0) {
      return res.status(400).json({ error: 'Роль не найдена' });
    }

    const roleId = roleData.rows[0].role_id;

    // Обновляем роль пользователя
    await db.query(
      'UPDATE users SET role_id = $1 WHERE user_id = $2',
      [roleId, id]
    );

    res.json({ message: 'Роль пользователя успешно обновлена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение списка всех пользователей (доступно только администратору)
router.get('/', authenticateJWT, checkRole(['system']), async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.user_id, u.username, u.email, r.name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id`
    );
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;