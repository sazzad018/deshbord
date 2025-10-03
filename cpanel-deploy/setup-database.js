import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL
    connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('✅ Connected to MySQL database');

    // Create admin_users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(36) PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ admin_users table created/verified');

    // Check if admin exists
    const [rows] = await connection.execute(
      'SELECT * FROM admin_users WHERE username = ? LIMIT 1',
      ['admin']
    );
    
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminId = randomUUID();
      
      await connection.execute(
        'INSERT INTO admin_users (id, username, password, full_name) VALUES (?, ?, ?, ?)',
        [adminId, 'admin', hashedPassword, 'Administrator']
      );
      console.log('✅ Default admin user created');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');
    } else {
      console.log('✅ Admin user already exists');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your Node.js app in cPanel');
    console.log('2. Visit your website');
    console.log('3. Login with admin/admin123');
    console.log('4. Change your password!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
