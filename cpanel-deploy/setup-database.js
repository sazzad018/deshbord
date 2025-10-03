import pkg from 'pg';
const { Client } = pkg;
import bcrypt from 'bcryptjs';

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Create admin user table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Check if admin exists
    const adminCheck = await client.query('SELECT * FROM admin_users WHERE username = $1', ['admin']);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO admin_users (username, password, full_name) VALUES ($1, $2, $3)',
        ['admin', hashedPassword, 'Administrator']
      );
      console.log('✅ Admin user created (username: admin, password: admin123)');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('✅ Database setup completed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    await client.end();
    process.exit(1);
  }
}

setupDatabase();
