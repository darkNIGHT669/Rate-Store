const { v4: uuid } = require('uuid');
const db = require('../config/db');

const submitOrUpdate = (userId, storeId, value) => {
  const store = db.get('SELECT id FROM stores WHERE id=?', [storeId]);
  if (!store) { const e = new Error('Store not found'); e.status = 404; throw e; }

  const existing = db.get(
    'SELECT id FROM ratings WHERE user_id=? AND store_id=?', [userId, storeId]
  );

  if (existing) {
    db.run(
      "UPDATE ratings SET value=?, updated_at=datetime('now') WHERE id=?",
      [value, existing.id]
    );
    return db.get('SELECT * FROM ratings WHERE id=?', [existing.id]);
  }

  const id = uuid();
  db.run(
    'INSERT INTO ratings (id,user_id,store_id,value) VALUES (?,?,?,?)',
    [id, userId, storeId, value]
  );
  return db.get('SELECT * FROM ratings WHERE id=?', [id]);
};

module.exports = { submitOrUpdate };
