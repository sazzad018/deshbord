#!/usr/bin/env node

// Database Setup Script for cPanel
// This creates all the required tables for Social Ads Expert

import postgres from 'postgres';
import crypto from 'crypto';

console.log('🚀 Setting up database for Social Ads Expert...\n');

// ⚠️ EDIT THIS WITH YOUR ACTUAL DATABASE PASSWORD  
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://beautyzo_ads:your_password@localhost:5432/beautyzo_desh";

// Generate UUID function (compatible with all hosting)
function generateUUID() {
  return crypto.randomUUID();
}

// Create tables SQL - NO EXTENSIONS REQUIRED for cPanel compatibility
const createTablesSQL = `
-- Create clients table (no extensions needed)
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  fb TEXT,
  profile_picture TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  wallet_deposited INTEGER NOT NULL DEFAULT 0,
  wallet_spent INTEGER NOT NULL DEFAULT 0,
  scopes JSONB NOT NULL DEFAULT '[]',
  portal_key TEXT NOT NULL UNIQUE,
  admin_notes TEXT,
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create spend_logs table  
CREATE TABLE IF NOT EXISTS spend_logs (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  date TEXT NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  balance_after INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create service_scopes table
CREATE TABLE IF NOT EXISTS service_scopes (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  service_name TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  start_date TIMESTAMP DEFAULT NOW() NOT NULL,
  end_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  datetime TIMESTAMP NOT NULL,
  location TEXT NOT NULL,
  reminders JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id VARCHAR PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Pending',
  due_date TIMESTAMP,
  client_id VARCHAR REFERENCES clients(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create whatsapp_templates table
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  message TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id VARCHAR PRIMARY KEY,
  company_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create custom_buttons table
CREATE TABLE IF NOT EXISTS custom_buttons (
  id VARCHAR PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  bg_color TEXT NOT NULL DEFAULT 'bg-blue-500',
  text_color TEXT NOT NULL DEFAULT 'text-white',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create website_projects table
CREATE TABLE IF NOT EXISTS website_projects (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  project_name TEXT NOT NULL,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  launch_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create uploads table  
CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create invoice_pdfs table
CREATE TABLE IF NOT EXISTS invoice_pdfs (
  id VARCHAR PRIMARY KEY,
  client_name TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
`;

// Insert sample data using Node.js generated UUIDs (cPanel compatible)
async function insertSampleData(sql) {
  try {
    // Check if we already have data
    const existingClients = await sql`SELECT COUNT(*) as count FROM clients`;
    if (existingClients[0].count > 0) {
      console.log('📊 Sample data already exists, skipping insertion');
      return;
    }

    console.log('📊 Inserting sample Bengali data...');

    // Generate UUIDs for sample clients
    const client1Id = generateUUID();
    const client2Id = generateUUID();

    // Insert sample clients with generated UUIDs
    await sql`
      INSERT INTO clients (id, name, phone, fb, status, wallet_deposited, wallet_spent, scopes, portal_key) VALUES
      (${client1Id}, 'রিয়াদ ট্রেডার্স', '+8801XXXXXXXXX', 'https://fb.com/riyadtraders', 'Active', 50000, 10000, '["Facebook Marketing", "Landing Page Design"]', 'rt-8x1'),
      (${client2Id}, 'মীরা ফুডস', '+8801YYYYYYYYY', 'https://fb.com/mirafoods', 'Active', 120000, 92000, '["Facebook Marketing", "Business Consultancy"]', 'mf-3k9')
    `;

    // Insert sample WhatsApp templates
    await sql`
      INSERT INTO whatsapp_templates (id, name, message, is_default) VALUES
      (${generateUUID()}, 'ফলোআপ মেসেজ', 'আসসালামু আলাইকুম {client_name}, আপনার প্রোজেক্টের আপডেট দিতে যোগাযোগ করলাম। আপনার সুবিধামত সময়ে কথা বলতে পারি কি?', true),
      (${generateUUID()}, 'পেমেন্ট রিমাইন্ডার', 'প্রিয় {client_name}, আপনার ইনভয়েস #{invoice_number} এর পেমেন্ট পেন্ডিং রয়েছে। অনুগ্রহ করে যত দ্রুত সম্ভব পেমেন্ট করুন।', false),
      (${generateUUID()}, 'প্রোজেক্ট কমপ্লিট', 'আপনার প্রোজেক্ট সফলভাবে সম্পন্ন হয়েছে। ফিডব্যাক দিতে এই লিংকে ক্লিক করুন।', false)
    `;

    // Insert default company settings  
    await sql`
      INSERT INTO company_settings (id, company_name, address, phone, email) VALUES
      (${generateUUID()}, 'Social Ads Expert', 'Dhaka, Bangladesh', '+880XXXXXXXXX', 'info@example.com')
    `;

    console.log('✅ Sample data inserted successfully!');

  } catch (error) {
    console.log('⚠️  Sample data insertion failed (tables created successfully though):', error.message);
  }
}

async function setupDatabase() {
  let sql;
  
  try {
    console.log('📡 Connecting to database...');
    console.log('🔗 Using localhost connection (SSL disabled for cPanel)');
    
    sql = postgres(DATABASE_URL, {
      ssl: false,
      max: 5,
      connect_timeout: 10
    });

    console.log('✅ Connected successfully!');
    console.log('🔧 Creating database tables (no extensions required)...');

    // Execute the SQL to create tables
    await sql.unsafe(createTablesSQL);
    console.log('✅ All tables created successfully!');

    // Insert sample data using Node.js generated UUIDs
    await insertSampleData(sql);

    console.log('🎉 Database setup complete!\n');
    console.log('Your Social Ads Expert application is ready to run.');
    console.log('\n📋 Next steps:');
    console.log('1. Start your app: node index.js');
    console.log('2. Visit your domain to see the application');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Common solutions:');
    console.log('1. Edit this file and replace "your_password" with your actual password');
    console.log('2. Ensure PostgreSQL server is running');
    console.log('3. Verify database name exists in cPanel');
    console.log('4. Check user has CREATE TABLE privileges');
    console.log('5. Use localhost in DATABASE_URL, not external hostname');
    process.exit(1);
  } finally {
    if (sql) {
      await sql.end();
      console.log('📴 Database connection closed.');
    }
  }
}

// Run setup
setupDatabase();