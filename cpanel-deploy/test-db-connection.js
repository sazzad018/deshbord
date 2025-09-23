#!/usr/bin/env node

// Database Connection Tester for cPanel
// Usage: 
//   1. Edit the credentials below
//   2. Run: node test-db-connection.js
//   3. Use the working connection string in your .env

const postgres = require('postgres');

// ⚠️ EDIT THESE VALUES WITH YOUR ACTUAL DATABASE CREDENTIALS:
const DB_USER = 'your_username';     // Replace with your database username
const DB_PASS = 'your_password';     // Replace with your database password  
const DB_NAME = 'your_database';     // Replace with your database name

// Test different connection options with SSL configurations
const testConnections = [
  // Test 1: Localhost with SSL disabled (Most common for cPanel)
  {
    name: "Localhost - SSL Disabled",
    url: `postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}`,
    ssl: false
  },
  
  // Test 2: Localhost with SSL prefer
  {
    name: "Localhost - SSL Prefer", 
    url: `postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}`,
    ssl: 'prefer'
  },
  
  // Test 3: 127.0.0.1 with SSL disabled
  {
    name: "Local IP - SSL Disabled",
    url: `postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}`,
    ssl: false
  },
  
  // Test 4: Original hostname with SSL disabled
  {
    name: "jupiter.hostseba.com - SSL Disabled",
    url: `postgresql://${DB_USER}:${DB_PASS}@jupiter.hostseba.com:5432/${DB_NAME}`,
    ssl: false
  },
  
  // Test 5: Original hostname with SSL required (if external SSL is needed)
  {
    name: "jupiter.hostseba.com - SSL Required",
    url: `postgresql://${DB_USER}:${DB_PASS}@jupiter.hostseba.com:5432/${DB_NAME}`,
    ssl: 'require'
  }
];

async function testConnection(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log(`📡 URL: ${config.url.replace(/:([^:@]*?)@/, ':****@')}`); // Hide password
  console.log(`🔒 SSL: ${config.ssl}`);
  
  try {
    const sql = postgres(config.url, {
      ssl: config.ssl,
      connect_timeout: 5,
      max: 1,
      onnotice: () => {} // Suppress notices
    });
    
    const result = await sql`SELECT version()`;
    console.log(`✅ SUCCESS: Connected to PostgreSQL`);
    console.log(`📋 Version: ${result[0].version.substring(0, 50)}...`);
    
    await sql.end();
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Database Connection Tester for cPanel\n');
  console.log('⚠️  INSTRUCTIONS:');
  console.log('1. Replace "your_username", "your_password", "your_database" with your actual values');
  console.log('2. Run: node test-db-connection.js');
  console.log('3. Check which connection works\n');
  
  let successFound = false;
  
  for (const config of testConnections) {
    const success = await testConnection(config);
    if (success && !successFound) {
      successFound = true;
      console.log(`\n🎉 USE THIS CONNECTION STRING:`);
      console.log(`DATABASE_URL="${config.url}"`);
    }
  }
  
  if (!successFound) {
    console.log('\n❌ No successful connections found.');
    console.log('\n💡 Try these steps:');
    console.log('1. Check your cPanel database credentials');
    console.log('2. Verify database name exists');
    console.log('3. Check Remote MySQL settings in cPanel');
    console.log('4. Contact your hosting provider for the correct hostname');
  }
}

main().catch(console.error);