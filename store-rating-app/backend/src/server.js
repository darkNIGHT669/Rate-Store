require('dotenv').config();
const { initDb } = require('./config/db');
const app = require('./app');
const { seedAdmin } = require('./services/auth.service');

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    // sql.js must be initialised async (loads WebAssembly)
    await initDb();

    // Seed default admin if not already present
    seedAdmin();

    app.listen(PORT, () => {
      console.log(`\n🚀 API running at http://localhost:${PORT}/api`);
      console.log(`   Admin: admin@platform.com  |  Password: Admin@123`);
      console.log(`   DB:    data/store_ratings.db  (pure JS SQLite – no install needed)\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
};

start();
