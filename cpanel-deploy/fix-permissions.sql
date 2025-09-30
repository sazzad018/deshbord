-- =====================================================
-- Fix PostgreSQL 15+ Permissions Issue
-- =====================================================
-- Run this if you get "permission denied for relation" errors
-- This grants all necessary permissions to your database user
-- =====================================================

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO CURRENT_USER;
GRANT USAGE ON SCHEMA public TO CURRENT_USER;
GRANT CREATE ON SCHEMA public TO CURRENT_USER;

-- Grant permissions on all existing tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO CURRENT_USER;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO CURRENT_USER;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO CURRENT_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO CURRENT_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO CURRENT_USER;

-- Specifically grant on each table (if above doesn't work)
GRANT ALL ON admin_users TO CURRENT_USER;
GRANT ALL ON clients TO CURRENT_USER;
GRANT ALL ON spend_logs TO CURRENT_USER;
GRANT ALL ON service_scopes TO CURRENT_USER;
GRANT ALL ON meetings TO CURRENT_USER;
GRANT ALL ON todos TO CURRENT_USER;
GRANT ALL ON whatsapp_templates TO CURRENT_USER;
GRANT ALL ON company_settings TO CURRENT_USER;
GRANT ALL ON website_projects TO CURRENT_USER;
GRANT ALL ON custom_buttons TO CURRENT_USER;
GRANT ALL ON invoices TO CURRENT_USER;
GRANT ALL ON invoice_items TO CURRENT_USER;
GRANT ALL ON uploads TO CURRENT_USER;
GRANT ALL ON invoice_pdfs TO CURRENT_USER;
GRANT ALL ON quick_messages TO CURRENT_USER;
GRANT ALL ON payment_requests TO CURRENT_USER;
GRANT ALL ON project_types TO CURRENT_USER;
GRANT ALL ON projects TO CURRENT_USER;
GRANT ALL ON employees TO CURRENT_USER;
GRANT ALL ON project_assignments TO CURRENT_USER;
GRANT ALL ON project_payments TO CURRENT_USER;
GRANT ALL ON salary_payments TO CURRENT_USER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Permissions fixed successfully!';
    RAISE NOTICE '📋 All tables are now accessible';
    RAISE NOTICE '🔄 Restart your application';
END $$;
