const db = require('../config/db');

const ALLOWED_SORT = ['name','email','address','role','created_at'];

const findAll = ({ name, email, address, role, sortBy, sortOrder }) => {
  const conditions = [];
  const params = [];

  if (name)    { conditions.push("name    LIKE ?"); params.push(`%${name}%`); }
  if (email)   { conditions.push("email   LIKE ?"); params.push(`%${email}%`); }
  if (address) { conditions.push("address LIKE ?"); params.push(`%${address}%`); }
  if (role)    { conditions.push('role = ?');       params.push(role); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const col   = ALLOWED_SORT.includes(sortBy) ? sortBy : 'created_at';
  const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  return db.all(
    `SELECT id,name,email,address,role,created_at FROM users ${where} ORDER BY ${col} ${order}`,
    params
  );
};

const findOne = (id) => {
  const user = db.get(
    'SELECT id,name,email,address,role,created_at FROM users WHERE id=?', [id]
  );
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }

  if (user.role === 'store_owner') {
    const store = db.get(`
      SELECT s.id, s.name,
             COALESCE(AVG(r.value), 0)  AS average_rating,
             COUNT(r.id)                AS total_ratings
      FROM   stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE  s.owner_id = ?
      GROUP  BY s.id
    `, [id]);
    if (store) user.store = store;
  }
  return user;
};

const getDashboardStats = () => {
  const totalUsers   = db.get('SELECT COUNT(*) AS c FROM users',   []).c;
  const totalStores  = db.get('SELECT COUNT(*) AS c FROM stores',  []).c;
  const totalRatings = db.get('SELECT COUNT(*) AS c FROM ratings', []).c;
  return { totalUsers, totalStores, totalRatings };
};

module.exports = { findAll, findOne, getDashboardStats };
