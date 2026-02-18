require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'cambia-esto-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true'
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  })
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API operando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});
