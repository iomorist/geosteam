const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('home', {
    title: 'Geo Steam MVC',
    labs: [
      { num: 1, name: 'HTML/CSS', url: '/labs/static/index.html' },
      { num: 2, name: 'Формы и валидация', url: '/labs/static/auth.html' },
      { num: 3, name: 'REST + Telegram', url: '/labs/static/feedback.html' },
      { num: 4, name: 'MVC (Express)', url: '/mvc' },
      { num: 5, name: 'База данных', url: '/api/health' },
      { num: 6, name: 'Real-time JSON', url: 'http://localhost:3000/comments' },
      { num: 7, name: 'Docker', url: '/api/health' }
    ]
  });
});

module.exports = router;
