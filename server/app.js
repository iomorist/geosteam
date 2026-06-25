require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const SQLiteStoreFactory = require('connect-sqlite3');
const path = require('path');

const { runMigrations } = require('./db/migrations');

const authRoutes = require('./routes/authRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const commentRoutes = require('./routes/commentRoutes');
const locationRoutes = require('./routes/locationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const mvcRoutes = require('./routes/mvcRoutes');

async function createApp() {
  await runMigrations();

  const app = express();
  const SQLiteStore = SQLiteStoreFactory(session);

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: __dirname }),
    name: 'sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }));

  app.use('/labs/static', express.static(path.join(__dirname, '..', 'labs', 'static')));

  app.get('/', (req, res) => {
    res.json({ message: 'Geo Steam API is running', health: '/api/health', mvc: '/mvc', labs: '/labs/static/index.html' });
  });

  app.get('/api', (req, res) => {
    res.json({ message: 'Geo Steam API root', health: '/api/health' });
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      architecture: 'MVC (Express)',
      database: 'SQLite',
      labs: '/labs/static/index.html'
    });
  });

  app.use('/mvc', mvcRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/location', locationRoutes);
  app.use('/api/stats', statsRoutes);

  return app;
}

module.exports = { createApp };
