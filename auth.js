const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "supersecret";

// регистрация
router.post("/register", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (phone, password) VALUES ($1, $2)", [phone, hashed]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Пользователь уже существует" });
  }
});

// логин
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE phone=$1", [phone]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Нет такого пользователя" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Неверный пароль" });

    const token = jwt.sign({ id: user.id, phone: user.phone }, SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

module.exports = router;
