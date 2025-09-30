-- =====================================================
-- Social Ads Expert CRM - Database Schema
-- =====================================================
-- This SQL file creates all necessary tables for the application
-- Import this file to set up your database structure
--
-- Usage:
--   psql -U username -d database_name -f database-schema.sql
--   OR import via cPanel phpPgAdmin
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Admin Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Clients Table
-- =====================================================
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
);

-- =====================================================
-- Spend Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS spend_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id VARCHAR NOT NULL REFERENCES clients(id),
    date TEXT NOT NULL,
    amount INTEGER NOT NULL,
    note TEXT,
    balance_after INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Service Scopes Table
-- =====================================================
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
);

-- =====================================================
-- Meetings Table
-- =====================================================
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
);

-- =====================================================
-- Todos Table
-- =====================================================
CREATE TABLE IF NOT EXISTS todos (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Pending',
    due_date TIMESTAMP,
    client_id VARCHAR REFERENCES clients(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- WhatsApp Templates Table
-- =====================================================
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Company Settings Table
-- =====================================================
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
);

-- =====================================================
-- Website Projects Table
-- =====================================================
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
);

-- =====================================================
-- Custom Buttons Table
-- =====================================================
CREATE TABLE IF NOT EXISTS custom_buttons (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    bg_color TEXT NOT NULL DEFAULT '#8B5CF6',
    text_color TEXT NOT NULL DEFAULT '#FFFFFF',
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Invoices Table
-- =====================================================
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
);

-- =====================================================
-- Invoice Items Table
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR NOT NULL REFERENCES invoices(id),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Uploads Table
-- =====================================================
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
);

-- =====================================================
-- Invoice PDFs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_pdfs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR NOT NULL REFERENCES invoices(id),
    pdf_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Quick Messages Table
-- =====================================================
CREATE TABLE IF NOT EXISTS quick_messages (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Payment Requests Table
-- =====================================================
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
);

-- =====================================================
-- Project Types Table
-- =====================================================
CREATE TABLE IF NOT EXISTS project_types (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    default_features JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Projects Table
-- =====================================================
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
);

-- =====================================================
-- Employees Table
-- =====================================================
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
);

-- =====================================================
-- Project Assignments Table
-- =====================================================
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
);

-- =====================================================
-- Project Payments Table
-- =====================================================
CREATE TABLE IF NOT EXISTS project_payments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR NOT NULL REFERENCES projects(id),
    amount NUMERIC(10,2) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    payment_method TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- =====================================================
-- Salary Payments Table
-- =====================================================
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
);

-- =====================================================
-- Create Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_clients_portal_key ON clients(portal_key);
CREATE INDEX IF NOT EXISTS idx_clients_category ON clients(category);
CREATE INDEX IF NOT EXISTS idx_spend_logs_client_id ON spend_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_spend_logs_date ON spend_logs(date);
CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_meetings_datetime ON meetings(datetime);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📋 Total tables created: 23';
    RAISE NOTICE '🔑 Indexes created for performance optimization';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Create default admin user';
    RAISE NOTICE '   Username: admin';
    RAISE NOTICE '   Password: admin123 (hashed)';
    RAISE NOTICE '';
    RAISE NOTICE '   Run the application to auto-create admin user';
    RAISE NOTICE '   OR manually insert using bcrypt hash';
END $$;
