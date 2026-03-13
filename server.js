// server.js — Express + Socket.IO server with User Registration
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { pool, initializeDatabase } = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 4000;
const JWT_SECRET = 'your_jwt_secret_key_here'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Initialize database
initializeDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      province,
      municipality,
      dob,
      age,
      email,
      password
    } = req.body;

    // Validate required fields
    if (!firstName || !province || !municipality || !dob || !age || !email || !password) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO users (first_name, middle_name, province, municipality, date_of_birth, age, email, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, middleName || null, province, municipality, dob, age, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email: email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token: token,
      user: {
        id: result.insertId,
        firstName,
        middleName,
        province,
        municipality,
        dob,
        age,
        email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        firstName: user.first_name,
        middleName: user.middle_name,
        province: user.province,
        municipality: user.municipality,
        dob: user.date_of_birth,
        age: user.age,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, first_name, middle_name, province, municipality, date_of_birth, age, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO functionality (existing chat functionality)
const users = new Map();

io.on('connection', socket => {
  socket.on('join', username => {
    users.set(socket.id, username || 'Anonymous');
    io.emit('users', Array.from(users.values()));
  });

  socket.on('chat message', text => {
    const user = users.get(socket.id) || 'Anonymous';
    const payload = { user, text, ts: Date.now() };
    io.emit('chat message', payload);
  });

  socket.on('disconnect', ()=>{
    users.delete(socket.id);
    io.emit('users', Array.from(users.values()));
  });
});

server.listen(PORT, ()=> console.log(`Server running: http://localhost:${PORT}`));
