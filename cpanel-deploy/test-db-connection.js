#!/usr/bin/env node

// Database Connection Tester for cPanel
// Run: node test-db-connection.js

const postgres = require('postgres');

// Test different connection options
const testConnections = [
  // Test 1: Localhost
  {
    name: "Localhost Connection",
    url: "postgresql://your_username:your_password@localhost:5432/your_database"
  },
  
  // Test 2: Localhost without port
  {
    name: "Localhost No Port",
    url: "postgresql://your_username:your_password@localhost/your_database"
  },
  
  // Test 3: Original hostname
  {
    name: "Original Hostname",
    url: "postgresql://your_username:your_password@jupiter.hostseba.com:5432/your_database"
  }
];

async function testConnection(config) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log(`📡 URL: ${config.url.replace(/:([^:@]*?)@/, ':****@')}`); // Hide password
  
  try {
    const sql = postgres(config.url, {
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