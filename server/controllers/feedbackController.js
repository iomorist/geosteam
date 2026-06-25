const feedbackModel = require('../models/feedbackModel');

async function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
  });
  return res.ok;
}

async function submit(req, res) {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const text = `<b>Geo Steam — обратная связь</b>\n\n` +
    `<b>Имя:</b> ${name}\n<b>Email:</b> ${email}\n<b>Сообщение:</b>\n${message}`;

  let telegramSent = false;
  try {
    telegramSent = await sendTelegram(text);
  } catch (e) {
    console.error('Telegram error:', e);
  }

  try {
    const record = await feedbackModel.create({ name, email, message, telegramSent });
    res.json({ success: true, id: record.id, telegramSent });
  } catch (e) {
    console.error('Feedback save error:', e);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
}

async function list(req, res) {
  try {
    const items = await feedbackModel.getAll();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

module.exports = { submit, list };
