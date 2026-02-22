const initSqlJs = require('sql.js');
const path = require('path');
const fs   = require('fs');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_PATH  = path.join(DATA_DIR, 'store_ratings.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let db; // sql.js Database instance

// ── Persist DB to disk after every write ─────────────────────
const persist = () => {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
};

// ── Helpers that mimic the better-sqlite3 API ─────────────────
// run(sql, ...params)  – for INSERT / UPDATE / DELETE
const run = (sql, params = []) => {
  db.run(sql, params);
  persist();
};

// get(sql, ...params)  – returns first row or undefined
const get = (sql, params = []) => {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
};

// all(sql, ...params)  – returns array of rows
const all = (sql, params = []) => {
  const stmt   = db.prepare(sql);
  const rows   = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
};

// ── Bootstrap: init sql.js, load or create DB ─────────────────
const initDb = async () => {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password   TEXT NOT NULL,
      address    TEXT,
      role       TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stores (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      address    TEXT,
      owner_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
      store_id   TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      value      INTEGER NOT NULL CHECK(value BETWEEN 1 AND 5),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, store_id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email   ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role    ON users(role);
    CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_user  ON ratings(user_id);
    CREATE INDEX IF NOT EXISTS idx_stores_owner  ON stores(owner_id);
  `);

  persist(); // save initial structure
  console.log(`✅ SQLite ready → ${DB_PATH}`);
};

module.exports = { initDb, run, get, all };
