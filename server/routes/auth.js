const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const validRoles = ['user', 'manager', 'system'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Неверная роль пользователя' });
    }

    const userExists = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким именем или email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleData = await db.query(
      'SELECT role_id FROM roles WHERE name = $1',
      [role]
    );

    if (roleData.rows.length === 0) {
      return res.status(400).json({ error: 'Роль не найдена' });
    }

    const roleId = roleData.rows[0].role_id;

    await db.query(
      'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)',
      [username, email, hashedPassword, roleId]
    );

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.query(
      `SELECT u.user_id, u.username, u.password, r.name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.role_id 
       WHERE username = $1`,
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const userData = user.rows[0];
    const isMatch = await bcrypt.compare(password, userData.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Неверное имя пользователя или пароль' });
    }

    const token = jwt.sign(
      {
        userId: userData.user_id,
        username: userData.username,
        role: userData.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      role: userData.role,
      message: 'Вход выполнен успешно' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;