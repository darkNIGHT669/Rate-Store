const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const db     = require('../config/db');

const signToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const register = ({ name, email, address, password }) => {
  const exists = db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (exists) { const e = new Error('Email already in use'); e.status = 409; throw e; }

  const hashed = bcrypt.hashSync(password, 10);
  const id = uuid();
  db.run(
    'INSERT INTO users (id,name,email,password,address,role) VALUES (?,?,?,?,?,?)',
    [id, name.trim(), email.toLowerCase(), hashed, address || null, 'user']
  );
  return db.get('SELECT id,name,email,address,role,created_at FROM users WHERE id=?', [id]);
};

const login = ({ email, password }) => {
  const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    const e = new Error('Invalid email or password'); e.status = 401; throw e;
  }
  return {
    accessToken: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

const updatePassword = (userId, newPassword) => {
  const hashed = bcrypt.hashSync(newPassword, 10);
  db.run("UPDATE users SET password=?, updated_at=datetime('now') WHERE id=?", [hashed, userId]);
  return { message: 'Password updated successfully' };
};

const createUser = ({ name, email, address, password, role }) => {
  const exists = db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (exists) { const e = new Error('Email already in use'); e.status = 409; throw e; }

  const hashed = bcrypt.hashSync(password, 10);
  const id = uuid();
  db.run(
    'INSERT INTO users (id,name,email,password,address,role) VALUES (?,?,?,?,?,?)',
    [id, name.trim(), email.toLowerCase(), hashed, address || null, role || 'user']
  );
  return db.get('SELECT id,name,email,address,role,created_at FROM users WHERE id=?', [id]);
};

const seedAdmin = () => {
  const exists = db.get("SELECT id FROM users WHERE email='admin@platform.com'", []);
  if (exists) return;

  const hashed = bcrypt.hashSync('Admin@123', 10);
  db.run(
    'INSERT INTO users (id,name,email,password,address,role) VALUES (?,?,?,?,?,?)',
    [uuid(), 'System Administrator Account', 'admin@platform.com', hashed,
     '123 Admin Street, Platform City', 'admin']
  );
  console.log('✅ Default admin seeded → admin@platform.com / Admin@123');
};

module.exports = { register, login, updatePassword, createUser, seedAdmin };
