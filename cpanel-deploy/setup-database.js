#!/usr/bin/env node

/**
 * Database Setup Script for Social Ads Expert CRM
 * 
 * This script creates all necessary database tables using Drizzle ORM.
 * Run this ONCE before starting your application for the first time.
 * 
 * Usage:
 *   node setup-database.js
 * 
 * Make sure all environment variables are set before running:
 *   - DATABASE_URL
 *   - PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from './index.js';

const {
  clients,
  spendLogs,
  serviceScopes,
  meetings,
  todos,
  whatsappTemplates,
  companySettings,
  websiteProjects,
  customButtons,
  invoices,
  invoiceItems,
  uploads,
  invoicePdfs,
  quickMessages,
  paymentRequests,
  projectTypes,
  projects,
  employees,
  projectAssignments,
  projectPayments,
  salaryPayments,
  adminUsers
} = schema;

console.log('\n🚀 Social Ads Expert - Database Setup\n');
console.log('=====================================\n');

// Check environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.log('\n📋 Please set the following environment variables:');
  console.log('   - DATABASE_URL');
  console.log('   - PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT');
  console.log('\nExample:');
  console.log('   export DATABASE_URL=postgresql://user:password@host:5432/database');
  process.exit(1);
}

console.log('✅ Database URL configured');
console.log(`📊 Connecting to: ${process.env.PGDATABASE}@${process.env.PGHOST}\n`);

// Create database connection
const connection = postgres(process.env.DATABASE_URL, {
  ssl: false,
  max: 1,
});

const db = drizzle(connection);

async function setupDatabase() {
  try {
    console.log('🔧 Creating database tables...\n');

    // Create admin_users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: admin_users');

    // Create clients table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        fb TEXT,
        profile_picture TEXT,
        status TEXT NOT NULL DEFAULT 'Active',
        is_active BOOLEAN NOT NULL DEFAULT true,
        wallet_deposited INTEGER NOT NULL DEFAULT 0,
        wallet_spent INTEGER NOT NULL DEFAULT 0,
        scopes JSONB NOT NULL DEFAULT '[]',
        portal_key TEXT NOT NULL,
        admin_notes TEXT,
        category TEXT NOT NULL DEFAULT 'general',
        deleted BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: clients');

    // Create spend_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS spend_logs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id VARCHAR NOT NULL REFERENCES clients(id),
        date TEXT NOT NULL,
        amount INTEGER NOT NULL,
        note TEXT,
        balance_after INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: spend_logs');

    // Create service_scopes table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS service_scopes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id VARCHAR NOT NULL REFERENCES clients(id),
        service_name TEXT NOT NULL,
        scope TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        start_date TIMESTAMP DEFAULT NOW() NOT NULL,
        end_date TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: service_scopes');

    // Create meetings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS meetings (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id VARCHAR NOT NULL REFERENCES clients(id),
        title TEXT NOT NULL,
        datetime TIMESTAMP NOT NULL,
        location TEXT NOT NULL,
        reminders JSONB NOT NULL DEFAULT '[]',
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: meetings');

    // Create todos table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS todos (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL DEFAULT 'Medium',
        status TEXT NOT NULL DEFAULT 'Pending',
        due_date TIMESTAMP,
        client_id VARCHAR REFERENCES clients(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: todos');

    // Create whatsapp_templates table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS whatsapp_templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: whatsapp_templates');

    // Create company_settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS company_settings (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company_name TEXT NOT NULL,
        company_address TEXT,
        company_phone TEXT,
        company_email TEXT,
        company_website TEXT,
        company_logo TEXT,
        currency TEXT NOT NULL DEFAULT 'BDT',
        exchange_rate NUMERIC(10,2) NOT NULL DEFAULT 110.0,
        invoice_prefix TEXT NOT NULL DEFAULT 'INV',
        invoice_counter INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: company_settings');

    // Create website_projects table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS website_projects (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT,
        admin_notes TEXT,
        client_id VARCHAR REFERENCES clients(id),
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        features JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: website_projects');

    // Create custom_buttons table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS custom_buttons (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        label TEXT NOT NULL,
        url TEXT NOT NULL,
        icon TEXT,
        bg_color TEXT NOT NULL DEFAULT '#8B5CF6',
        text_color TEXT NOT NULL DEFAULT '#FFFFFF',
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: custom_buttons');

    // Create invoices table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number TEXT NOT NULL UNIQUE,
        client_id VARCHAR NOT NULL REFERENCES clients(id),
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        total_amount NUMERIC(10,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: invoices');

    // Create invoice_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id VARCHAR NOT NULL REFERENCES invoices(id),
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price NUMERIC(10,2) NOT NULL,
        total NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: invoice_items');

    // Create uploads table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS uploads (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        url TEXT NOT NULL,
        client_id VARCHAR REFERENCES clients(id),
        uploaded_by TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: uploads');

    // Create invoice_pdfs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS invoice_pdfs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id VARCHAR NOT NULL REFERENCES invoices(id),
        pdf_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: invoice_pdfs');

    // Create quick_messages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS quick_messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        icon TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: quick_messages');

    // Create payment_requests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id VARCHAR NOT NULL REFERENCES clients(id),
        amount NUMERIC(10,2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'BDT',
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT,
        transaction_id TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        paid_at TIMESTAMP
      )
    `);
    console.log('✅ Created table: payment_requests');

    // Create project_types table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_types (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        default_features JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: project_types');

    // Create projects table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id VARCHAR NOT NULL REFERENCES clients(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Planning',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        budget NUMERIC(10,2),
        description TEXT,
        features JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: projects');

    // Create employees table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT NOT NULL,
        department TEXT,
        salary NUMERIC(10,2),
        join_date TIMESTAMP,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: employees');

    // Create project_assignments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_assignments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR NOT NULL REFERENCES projects(id),
        employee_id VARCHAR NOT NULL REFERENCES employees(id),
        role TEXT,
        assigned_date TIMESTAMP DEFAULT NOW() NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        completed_date TIMESTAMP,
        completed_features JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: project_assignments');

    // Create project_payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS project_payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR NOT NULL REFERENCES projects(id),
        amount NUMERIC(10,2) NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        payment_method TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: project_payments');

    // Create salary_payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS salary_payments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id VARCHAR NOT NULL REFERENCES employees(id),
        amount NUMERIC(10,2) NOT NULL,
        payment_date TIMESTAMP NOT NULL,
        payment_method TEXT,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    console.log('✅ Created table: salary_payments');

    console.log('\n✨ Database setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Start your application: node index.js');
    console.log('   2. Visit your domain to access the admin panel');
    console.log('   3. Login with: admin / admin123');
    console.log('   4. IMPORTANT: Change the admin password immediately!\n');

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the setup
setupDatabase();
