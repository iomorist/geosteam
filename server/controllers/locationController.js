const locationModel = require('../models/locationModel');

async function update(req, res) {
  const userId = String(req.session.userId);
  const { latitude, longitude, country, city } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const recordId = await locationModel.saveLocation(userId, { latitude, longitude, country, city });
    res.json({ success: true, message: 'Location updated successfully', recordId });
  } catch (e) {
    console.error('Location update error:', e);
    res.status(500).json({ error: 'Failed to save location' });
  }
}

async function countries(req, res) {
  try {
    const rows = await locationModel.getCountryStats(String(req.session.userId));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch country statistics' });
  }
}

async function cities(req, res) {
  try {
    const rows = await locationModel.getCityStats(String(req.session.userId));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch city statistics' });
  }
}

async function history(req, res) {
  try {
    const limit = req.query.limit || 50;
    const rows = await locationModel.getHistory(String(req.session.userId), limit);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch location history' });
  }
}

module.exports = { update, countries, cities, history };
