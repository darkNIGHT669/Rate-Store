const { v4: uuid } = require('uuid');
const db = require('../config/db');

const ALLOWED_SORT = ['name','email','address','created_at','average_rating'];

const create = ({ name, email, address, ownerId }) => {
  if (ownerId) {
    const owner = db.get("SELECT id FROM users WHERE id=? AND role='store_owner'", [ownerId]);
    if (!owner) {
      const e = new Error('Provided owner must have role store_owner'); e.status = 400; throw e;
    }
  }
  const id = uuid();
  db.run(
    'INSERT INTO stores (id,name,email,address,owner_id) VALUES (?,?,?,?,?)',
    [id, name.trim(), email.toLowerCase(), address || null, ownerId || null]
  );
  return db.get('SELECT * FROM stores WHERE id=?', [id]);
};

const findAll = ({ name, address, sortBy, sortOrder, userId }) => {
  const conditions = [];
  const params = [];

  if (name)    { conditions.push("s.name    LIKE ?"); params.push(`%${name}%`); }
  if (address) { conditions.push("s.address LIKE ?"); params.push(`%${address}%`); }

  const where   = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const col     = ALLOWED_SORT.includes(sortBy) ? sortBy : 'name';
  const safeCol = col === 'average_rating' ? 'average_rating' : `s.${col}`;
  const order   = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const stores = db.all(`
    SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
           COALESCE(AVG(r.value), 0) AS average_rating,
           COUNT(r.id)               AS total_ratings
    FROM   stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    ${where}
    GROUP BY s.id
    ORDER BY ${safeCol} ${order}
  `, params);

  if (!userId) return stores;

  const userRatings = db.all('SELECT store_id, value FROM ratings WHERE user_id=?', [userId]);
  const ratingMap   = Object.fromEntries(userRatings.map((r) => [r.store_id, r.value]));
  return stores.map((s) => ({ ...s, user_rating: ratingMap[s.id] ?? null }));
};

const findOne = (id, userId) => {
  const store = db.get(`
    SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
           COALESCE(AVG(r.value), 0) AS average_rating,
           COUNT(r.id)               AS total_ratings
    FROM   stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    WHERE  s.id = ?
    GROUP  BY s.id
  `, [id]);

  if (!store) { const e = new Error('Store not found'); e.status = 404; throw e; }

  if (userId) {
    const ur = db.get('SELECT value FROM ratings WHERE user_id=? AND store_id=?', [userId, id]);
    store.user_rating = ur?.value ?? null;
  }
  return store;
};

const getOwnerDashboard = (ownerId) => {
  const store = db.get(
    'SELECT id,name,email,address FROM stores WHERE owner_id=?', [ownerId]
  );
  if (!store) {
    const e = new Error('No store is associated with your account'); e.status = 404; throw e;
  }

  const agg = db.get(`
    SELECT COALESCE(AVG(value), 0) AS average_rating,
           COUNT(*)                AS total_ratings
    FROM ratings WHERE store_id=?
  `, [store.id]);

  const raters = db.all(`
    SELECT u.id, u.name, u.email, r.value AS rating, r.created_at AS rated_at
    FROM   ratings r
    JOIN   users u ON u.id = r.user_id
    WHERE  r.store_id = ?
    ORDER  BY r.created_at DESC
  `, [store.id]);

  return {
    store,
    averageRating: parseFloat(parseFloat(agg.average_rating).toFixed(2)),
    totalRatings:  agg.total_ratings,
    raters,
  };
};

module.exports = { create, findAll, findOne, getOwnerDashboard };
