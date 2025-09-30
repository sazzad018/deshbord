-- ==================================================
-- MANUAL PERMISSION FIX SCRIPT
-- ==================================================
-- 
-- HOW TO USE:
-- 1. Find your database username from cPanel → PostgreSQL
-- 2. Replace 'YOUR_USERNAME_HERE' with your actual username
-- 3. Replace 'YOUR_DATABASE_HERE' with your actual database name
-- 4. Run this in phpPgAdmin SQL tab
-- 
-- ==================================================

-- STEP 1: Make yourself database owner (BEST SOLUTION)
-- Replace both placeholders below:
ALTER DATABASE YOUR_DATABASE_HERE OWNER TO YOUR_USERNAME_HERE;

-- STEP 2: Grant all permissions on schema
GRANT ALL PRIVILEGES ON SCHEMA public TO YOUR_USERNAME_HERE;
GRANT USAGE ON SCHEMA public TO YOUR_USERNAME_HERE;
GRANT CREATE ON SCHEMA public TO YOUR_USERNAME_HERE;

-- STEP 3: Grant permissions on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO YOUR_USERNAME_HERE;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO YOUR_USERNAME_HERE;

-- STEP 4: Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO YOUR_USERNAME_HERE;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO YOUR_USERNAME_HERE;

-- STEP 5: Specific table grants (backup if above doesn't work)
GRANT ALL ON admin_users TO YOUR_USERNAME_HERE;
GRANT ALL ON clients TO YOUR_USERNAME_HERE;
GRANT ALL ON spend_logs TO YOUR_USERNAME_HERE;
GRANT ALL ON service_scopes TO YOUR_USERNAME_HERE;
GRANT ALL ON meetings TO YOUR_USERNAME_HERE;
GRANT ALL ON todos TO YOUR_USERNAME_HERE;
GRANT ALL ON whatsapp_templates TO YOUR_USERNAME_HERE;
GRANT ALL ON company_settings TO YOUR_USERNAME_HERE;
GRANT ALL ON website_projects TO YOUR_USERNAME_HERE;
GRANT ALL ON custom_buttons TO YOUR_USERNAME_HERE;
GRANT ALL ON invoices TO YOUR_USERNAME_HERE;
GRANT ALL ON invoice_items TO YOUR_USERNAME_HERE;
GRANT ALL ON uploads TO YOUR_USERNAME_HERE;
GRANT ALL ON invoice_pdfs TO YOUR_USERNAME_HERE;
GRANT ALL ON quick_messages TO YOUR_USERNAME_HERE;
GRANT ALL ON payment_requests TO YOUR_USERNAME_HERE;
GRANT ALL ON project_types TO YOUR_USERNAME_HERE;
GRANT ALL ON projects TO YOUR_USERNAME_HERE;
GRANT ALL ON employees TO YOUR_USERNAME_HERE;
GRANT ALL ON project_assignments TO YOUR_USERNAME_HERE;
GRANT ALL ON project_payments TO YOUR_USERNAME_HERE;
GRANT ALL ON salary_payments TO YOUR_USERNAME_HERE;

-- ==================================================
-- VERIFICATION
-- ==================================================
-- After running above, test with:
SELECT COUNT(*) FROM clients;

-- If this works, restart your Node.js app!
-- ==================================================
