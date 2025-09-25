-- Social Ads Expert Database Setup
-- Complete SQL file for cPanel PostgreSQL import
-- Generated: September 25, 2025

-- ============================
-- TABLE CREATION STATEMENTS
-- ============================

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  fb TEXT,
  profile_picture TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  wallet_deposited INTEGER NOT NULL DEFAULT 0,
  wallet_spent INTEGER NOT NULL DEFAULT 0,
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
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
  reminders JSONB NOT NULL DEFAULT '[]'::jsonb,
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
  company_name TEXT NOT NULL DEFAULT 'Social Ads Expert',
  company_email TEXT,
  company_phone TEXT,
  company_website TEXT,
  company_address TEXT,
  logo_url TEXT,
  brand_color TEXT NOT NULL DEFAULT '#A576FF',
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create custom_buttons table
CREATE TABLE IF NOT EXISTS custom_buttons (
  id VARCHAR PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'ExternalLink',
  color TEXT DEFAULT 'primary',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create website_projects table
CREATE TABLE IF NOT EXISTS website_projects (
  id VARCHAR PRIMARY KEY,
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  project_name VARCHAR NOT NULL,
  portal_key VARCHAR NOT NULL UNIQUE,
  project_status VARCHAR NOT NULL DEFAULT 'In Progress',
  website_url VARCHAR,
  notes TEXT,
  completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create uploads table
CREATE TABLE IF NOT EXISTS uploads (
  id VARCHAR PRIMARY KEY,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  data TEXT NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create invoice_pdfs table
CREATE TABLE IF NOT EXISTS invoice_pdfs (
  id VARCHAR PRIMARY KEY,
  invoice_no TEXT NOT NULL,
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  size INTEGER NOT NULL,
  data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  client_id VARCHAR NOT NULL REFERENCES clients(id),
  company_id VARCHAR REFERENCES company_settings(id),
  issue_date TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  currency TEXT NOT NULL DEFAULT 'BDT',
  sub_total INTEGER NOT NULL DEFAULT 0,
  discount_pct INTEGER NOT NULL DEFAULT 0,
  discount_amt INTEGER NOT NULL DEFAULT 0,
  vat_pct INTEGER NOT NULL DEFAULT 0,
  vat_amt INTEGER NOT NULL DEFAULT 0,
  grand_total INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id VARCHAR PRIMARY KEY,
  invoice_id VARCHAR NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  rate INTEGER NOT NULL DEFAULT 0,
  amount INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================
-- SAMPLE DATA INSERT STATEMENTS
-- ============================

-- Insert sample clients (Bengali data)
INSERT INTO clients (id, name, phone, fb, status, wallet_deposited, wallet_spent, scopes, portal_key) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'রিয়াদ ট্রেডার্স', '+8801712345678', 'https://fb.com/riyadtraders', 'Active', 50000, 10000, '["Facebook Marketing", "Landing Page Design"]'::jsonb, 'rt-8x1'),
('550e8400-e29b-41d4-a716-446655440002', 'মীরা ফুডস', '+8801812345679', 'https://fb.com/mirafoods', 'Active', 120000, 92000, '["Facebook Marketing", "Business Consultancy"]'::jsonb, 'mf-3k9'),
('550e8400-e29b-41d4-a716-446655440003', 'আলিফ কোম্পানি', '+8801912345680', 'https://fb.com/alifcompany', 'Active', 75000, 25000, '["Social Media Management", "Content Creation"]'::jsonb, 'ac-5m2'),
('550e8400-e29b-41d4-a716-446655440004', 'সোনার বাংলা ট্রেড', '+8801612345681', 'https://fb.com/sonarbanglatrade', 'Active', 200000, 150000, '["Facebook Marketing", "Website Development"]'::jsonb, 'sbt-7n8');

-- Insert sample spend logs
INSERT INTO spend_logs (id, client_id, date, amount, note, balance_after) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2025-09-20', 5000, 'Facebook Ads Campaign - নিউ প্রোডাক্ট লঞ্চ', 45000),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2025-09-22', 3000, 'Landing Page Design', 42000),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '2025-09-21', 15000, 'Facebook Marketing - মাসিক ক্যাম্পেইন', 105000),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2025-09-23', 8000, 'Business Consultancy Session', 97000);

-- Insert sample WhatsApp templates (Bengali)
INSERT INTO whatsapp_templates (id, name, message, is_default) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'ফলোআপ মেসেজ', 'আসসালামু আলাইকুম {client_name}, আপনার প্রোজেক্টের আপডেট দিতে যোগাযোগ করলাম। আপনার সুবিধামত সময়ে কথা বলতে পারি কি? ধন্যবাদ - Social Ads Expert টিম', true),
('750e8400-e29b-41d4-a716-446655440002', 'পেমেন্ট রিমাইন্ডার', 'প্রিয় {client_name}, আপনার ইনভয়েস #{invoice_number} এর পেমেন্ট পেন্ডিং রয়েছে। অনুগ্রহ করে যত দ্রুত সম্ভব পেমেন্ট করুন। কোন সমস্যা থাকলে জানাবেন।', false),
('750e8400-e29b-41d4-a716-446655440003', 'প্রোজেক্ট কমপ্লিট', 'আপনার প্রোজেক্ট সফলভাবে সম্পন্ন হয়েছে! 🎉 ফিডব্যাক দিতে এই লিংকে ক্লিক করুন: {feedback_link}', false),
('750e8400-e29b-41d4-a716-446655440004', 'নতুন ক্লায়েন্ট স্বাগতম', 'স্বাগতম {client_name}! Social Ads Expert এ আপনাকে স্বাগতম। আমরা আপনার ব্যবসার সফলতার জন্য প্রতিশ্রুতিবদ্ধ। প্রয়োজনে যোগাযোগ করুন।', false);

-- Insert default company settings
INSERT INTO company_settings (id, company_name, company_address, company_phone, company_email, logo_url, brand_color) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'Social Ads Expert', 'Dhaka, Bangladesh', '+8801XXXXXXXXX', 'info@socialadsexpert.com', '/uploads/logo.png', '#A576FF');

-- Insert sample todos
INSERT INTO todos (id, title, description, priority, status, client_id) VALUES
('950e8400-e29b-41d4-a716-446655440001', 'রিয়াদ ট্রেডার্স এর ক্যাম্পেইন রিভিউ', 'নতুন প্রোডাক্ট লঞ্চ ক্যাম্পেইনের পারফরমেন্স চেক করতে হবে', 'High', 'Pending', '550e8400-e29b-41d4-a716-446655440001'),
('950e8400-e29b-41d4-a716-446655440002', 'মীরা ফুডস এর মাসিক রিপোর্ট', 'সেপ্টেম্বর মাসের মার্কেটিং রিপোর্ট প্রস্তুত করতে হবে', 'Medium', 'Pending', '550e8400-e29b-41d4-a716-446655440002'),
('950e8400-e29b-41d4-a716-446655440003', 'নতুন ক্লায়েন্ট অনবোর্ডিং', 'আলিফ কোম্পানির জন্য প্রাথমিক সেটাপ সম্পন্ন করতে হবে', 'High', 'Pending', '550e8400-e29b-41d4-a716-446655440003');

-- Insert sample website projects
INSERT INTO website_projects (id, client_id, project_name, portal_key, project_status, website_url) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'রিয়াদ ট্রেডার্স ওয়েবসাইট', 'rt-web-001', 'In Progress', 'https://riyadtraders.com'),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'মীরা ফুডস ই-কমার্স', 'mf-web-002', 'Completed', 'https://mirafoods.com');

-- Insert sample custom buttons
INSERT INTO custom_buttons (id, title, description, url, icon, color, sort_order) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'Facebook Business Manager', 'ক্লায়েন্টদের FB Business Manager অ্যাক্সেস', 'https://business.facebook.com', 'Facebook', 'primary', 1),
('b50e8400-e29b-41d4-a716-446655440002', 'Google Analytics', 'ওয়েবসাইট ট্রাফিক এনালিটিক্স', 'https://analytics.google.com', 'BarChart3', 'secondary', 2),
('b50e8400-e29b-41d4-a716-446655440003', 'Design Resources', 'গ্রাফিক্স ডিজাইন রিসোর্স', 'https://canva.com', 'Palette', 'success', 3);

-- ============================
-- INDEXES FOR PERFORMANCE
-- ============================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_portal_key ON clients(portal_key);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_spend_logs_client_id ON spend_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_spend_logs_date ON spend_logs(date);
CREATE INDEX IF NOT EXISTS idx_meetings_client_id ON meetings(client_id);
CREATE INDEX IF NOT EXISTS idx_meetings_datetime ON meetings(datetime);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_invoice_pdfs_client_id ON invoice_pdfs(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================
-- COMPLETION MESSAGE
-- ============================

-- Database setup completed successfully!
-- Your Social Ads Expert application is now ready to use.