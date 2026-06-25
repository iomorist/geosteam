const { db, run, get, all } = require('../db/database');

function updateStats(userId, country, city, previousLocation) {
  const isNewCountryVisit = !!country && (
    !previousLocation || previousLocation.country !== country
  );
  const isNewCityVisit = !!city && (
    !previousLocation ||
    previousLocation.city !== city ||
    previousLocation.country !== country
  );

  if (country) {
    db.run(`
      INSERT OR REPLACE INTO country_stats (user_id, country, total_time, visit_count, last_visit)
      VALUES (?, ?,
        COALESCE((SELECT total_time FROM country_stats WHERE user_id = ? AND country = ?), 0) + 1,
        COALESCE((SELECT visit_count FROM country_stats WHERE user_id = ? AND country = ?), 0) + ?,
        CURRENT_TIMESTAMP
      )
    `, [userId, country, userId, country, userId, country, isNewCountryVisit ? 1 : 0]);
  }

  if (city) {
    db.run(`
      INSERT OR REPLACE INTO city_stats (user_id, city, country, total_time, visit_count, last_visit)
      VALUES (?, ?, ?,
        COALESCE((SELECT total_time FROM city_stats WHERE user_id = ? AND city = ?), 0) + 1,
        COALESCE((SELECT visit_count FROM city_stats WHERE user_id = ? AND city = ?), 0) + ?,
        CURRENT_TIMESTAMP
      )
    `, [userId, city, country, userId, city, userId, city, isNewCityVisit ? 1 : 0]);
  }
}

async function saveLocation(userId, { latitude, longitude, country, city }) {
  const previousLocation = await get(`
    SELECT country, city FROM location_records
    WHERE user_id = ? ORDER BY timestamp DESC, id DESC LIMIT 1
  `, [userId]);

  const result = await run(
    `INSERT INTO location_records (user_id, latitude, longitude, country, city) VALUES (?, ?, ?, ?, ?)`,
    [userId, latitude, longitude, country || null, city || null]
  );

  updateStats(userId, country, city, previousLocation || null);
  return result.lastID;
}

async function getCountryStats(userId) {
  return all(`
    SELECT country, total_time, visit_count, last_visit
    FROM country_stats WHERE user_id = ? ORDER BY total_time DESC
  `, [userId]);
}

async function getCityStats(userId) {
  return all(`
    SELECT city, country, total_time, visit_count, last_visit
    FROM city_stats WHERE user_id = ? ORDER BY total_time DESC
  `, [userId]);
}

async function getHistory(userId, limit = 50) {
  return all(`
    SELECT latitude, longitude, country, city, timestamp
    FROM location_records WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
  `, [userId, limit]);
}

module.exports = { saveLocation, getCountryStats, getCityStats, getHistory };
