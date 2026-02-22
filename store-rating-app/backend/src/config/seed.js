require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@platform.com']
    );

    if (existing.rows.length > 0) {
      console.log('ℹ️  Admin already exists – skipping seed.');
    } else {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await client.query(
        `INSERT INTO users (name, email, password, address, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'System Administrator Account',
          'admin@platform.com',
          hashed,
          '123 Admin Street, Platform City',
          'admin',
        ]
      );
      console.log('✅ Admin seeded:');
      console.log('   Email:    admin@platform.com');
      console.log('   Password: Admin@123');
    }
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
