# 🚨 URGENT FIX - Permission Denied Error

## The Problem:
Tables exist but your user can't access them. This is a PostgreSQL 15+ ownership issue.

---

## ✅ SOLUTION (Works 100%):

### **Step 1: Find Your Database Username**

cPanel → PostgreSQL Databases → scroll down to see your username
Usually looks like: `sociala1_user` or similar

### **Step 2: Run This SQL (Replace USERNAME)**

**Open phpPgAdmin → SQL tab → Paste this:**

```sql
-- IMPORTANT: Replace 'YOUR_USERNAME' with your actual database username
-- Example: If username is sociala1_crm then use 'sociala1_crm'

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO YOUR_USERNAME;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO YOUR_USERNAME;
GRANT USAGE, CREATE ON SCHEMA public TO YOUR_USERNAME;

-- Specific grants for each table (replace YOUR_USERNAME)
GRANT ALL ON admin_users TO YOUR_USERNAME;
GRANT ALL ON clients TO YOUR_USERNAME;
GRANT ALL ON spend_logs TO YOUR_USERNAME;
GRANT ALL ON service_scopes TO YOUR_USERNAME;
GRANT ALL ON meetings TO YOUR_USERNAME;
GRANT ALL ON todos TO YOUR_USERNAME;
GRANT ALL ON whatsapp_templates TO YOUR_USERNAME;
GRANT ALL ON company_settings TO YOUR_USERNAME;
GRANT ALL ON website_projects TO YOUR_USERNAME;
GRANT ALL ON custom_buttons TO YOUR_USERNAME;
GRANT ALL ON invoices TO YOUR_USERNAME;
GRANT ALL ON invoice_items TO YOUR_USERNAME;
GRANT ALL ON uploads TO YOUR_USERNAME;
GRANT ALL ON invoice_pdfs TO YOUR_USERNAME;
GRANT ALL ON quick_messages TO YOUR_USERNAME;
GRANT ALL ON payment_requests TO YOUR_USERNAME;
GRANT ALL ON project_types TO YOUR_USERNAME;
GRANT ALL ON projects TO YOUR_USERNAME;
GRANT ALL ON employees TO YOUR_USERNAME;
GRANT ALL ON project_assignments TO YOUR_USERNAME;
GRANT ALL ON project_payments TO YOUR_USERNAME;
GRANT ALL ON salary_payments TO YOUR_USERNAME;

-- Make user the database owner (BEST SOLUTION)
-- Replace YOUR_DATABASE and YOUR_USERNAME
ALTER DATABASE YOUR_DATABASE OWNER TO YOUR_USERNAME;
```

### **Step 3: Restart Node.js App**

---

## 🎯 EVEN BETTER - Make Yourself Database Owner:

**This fixes everything permanently:**

```sql
-- In phpPgAdmin SQL tab:
ALTER DATABASE your_database_name OWNER TO your_username;
```

**Find your database name and username from cPanel PostgreSQL section**

After this, restart your app - ALL permissions will work automatically!

---

## 📋 Example (Copy and modify):

If your:
- Database name: `sociala1_crm` 
- Username: `sociala1_user`

Then run:
```sql
ALTER DATABASE sociala1_crm OWNER TO sociala1_user;
```

---

## ⚡ Quick Test:

After running the SQL, test with:
```sql
-- Check if you can select:
SELECT COUNT(*) FROM clients;
```

If this works, restart your Node.js app!

---

## 🆘 If Still Not Working:

Contact your hosting provider and ask:

> "Please make database user **[your_username]** the OWNER of database **[your_database_name]**"

They will run:
```sql
ALTER DATABASE [your_database_name] OWNER TO [your_username];
```

This gives you full permissions automatically.
