# 📋 cPanel Deployment Checklist

Use this checklist to ensure a smooth deployment of Social Ads Expert CRM to your cPanel hosting.

## Pre-Deployment Preparation

### ✅ Before Starting:
- [ ] Verify you have cPanel hosting account with Node.js support
- [ ] Confirm Node.js version 18 or higher is available
- [ ] Ensure PostgreSQL database is available
- [ ] Have your database credentials ready
- [ ] SSL certificate available (recommended)
- [ ] Domain/subdomain configured and pointing to hosting

## Step-by-Step Deployment

### 1. File Upload
- [ ] Create ZIP file of all contents in `cpanel-deploy` folder
- [ ] Login to cPanel File Manager
- [ ] Navigate to your Node.js app directory
- [ ] Upload ZIP file
- [ ] Extract ZIP file
- [ ] Verify all files are extracted correctly
- [ ] Check that `public/` folder and `index.js` are present

### 2. Database Setup
- [ ] Create new PostgreSQL database in cPanel
- [ ] Create database user
- [ ] Assign user to database with ALL PRIVILEGES
- [ ] Note down the following credentials:
  - [ ] Database name: `_________________`
  - [ ] Database user: `_________________`
  - [ ] Database password: `_________________`
  - [ ] Database host: `_________________` (usually `localhost`)
  - [ ] Database port: `_________________` (usually `5432`)

### 3. Generate Session Secret
- [ ] Generate secure session secret (32+ characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Save the generated secret: `_________________________________`

### 4. Node.js App Configuration
- [ ] Open "Setup Node.js App" in cPanel
- [ ] Click "CREATE APPLICATION"
- [ ] Set the following:
  - [ ] Node.js version: **18.x** or higher
  - [ ] Application mode: **Production**
  - [ ] Application root: `/home/username/your-app-folder`
  - [ ] Application URL: `your-domain.com` or subdomain
  - [ ] Startup file: **index.js**
- [ ] Click "CREATE"

### 5. Environment Variables
Add these environment variables in Node.js App settings:

#### Database Variables:
- [ ] `DATABASE_URL` = `postgresql://user:pass@host:5432/dbname`
- [ ] `PGUSER` = Your database username
- [ ] `PGPASSWORD` = Your database password
- [ ] `PGDATABASE` = Your database name
- [ ] `PGHOST` = Database host (usually `localhost`)
- [ ] `PGPORT` = Database port (usually `5432`)

#### Application Variables:
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000` (or your assigned port)
- [ ] `SESSION_SECRET` = Your generated 32+ character secret

### 6. Install Dependencies
- [ ] Click "Run NPM Install" in Node.js app settings
- [ ] Wait for installation to complete (2-5 minutes)
- [ ] Check for any error messages
- [ ] Verify installation completed successfully

### 7. Setup Database Tables (CRITICAL!)
⚠️ **This step MUST be completed before starting the application**

- [ ] Access cPanel Terminal or SSH
- [ ] Navigate to your application directory
- [ ] Run database setup script:
  ```bash
  node setup-database.js
  ```
- [ ] Wait for all tables to be created
- [ ] Look for success messages:
  - [ ] ✅ Created table: admin_users
  - [ ] ✅ Created table: clients
  - [ ] ✅ Created table: spend_logs
  - [ ] ✅ Created table: meetings
  - [ ] (and more...)
- [ ] Confirm "Database setup completed successfully!" message
- [ ] If errors occur:
  - [ ] Check environment variables are set correctly
  - [ ] Verify database connection works
  - [ ] Ensure database user has CREATE TABLE permission

### 8. Start Application
- [ ] Click "START" button in Node.js app settings
- [ ] Wait for status to change to "Running"
- [ ] Check application logs for any errors
- [ ] Note the application URL
- [ ] **If you see "Database tables not found" error:**
  - [ ] ⚠️ You forgot Step 7! Run `node setup-database.js` first
  - [ ] Then restart the application

### 9. Initial Testing
- [ ] Visit your application URL
- [ ] Verify admin login page loads correctly
- [ ] Test admin login with default credentials:
  - Username: `admin`
  - Password: `admin123`
- [ ] Confirm successful login
- [ ] Verify dashboard loads properly

### 10. Security Configuration
- [ ] **CRITICAL**: Change admin password immediately
  - [ ] Go to settings/profile section
  - [ ] Change password to a strong password
  - [ ] Use minimum 12 characters
  - [ ] Include uppercase, lowercase, numbers, and symbols
- [ ] Note new password securely: `_________________`
- [ ] Enable HTTPS/SSL if not already enabled
- [ ] Force HTTPS redirects in cPanel
- [ ] Test HTTPS access

### 11. Final Verification
- [ ] Test all major features:
  - [ ] Client list loads
  - [ ] Can create new client
  - [ ] Financial tracking works
  - [ ] Projects section accessible
  - [ ] Meetings section functional
  - [ ] Export features work
- [ ] Test client portal with a portal key
- [ ] Test employee portal
- [ ] Check browser console for JavaScript errors
- [ ] Verify all images and styles load correctly

### 12. Production Optimization
- [ ] Enable gzip compression in cPanel (if available)
- [ ] Set up database backup schedule
- [ ] Configure error monitoring (optional)
- [ ] Set up uptime monitoring (optional)
- [ ] Document your deployment configuration

### 13. Post-Deployment
- [ ] Create admin documentation
- [ ] Train users on the system
- [ ] Set up regular backup schedule
- [ ] Schedule maintenance windows
- [ ] Monitor application logs regularly

## Troubleshooting Checklist

If application doesn't start:
- [ ] Node.js version is 18 or higher
- [ ] All environment variables are set correctly
- [ ] Database credentials are correct
- [ ] Database exists and is accessible
- [ ] `npm install` completed without errors
- [ ] Check application logs for specific errors

If login doesn't work:
- [ ] Wait 2-3 minutes for database initialization
- [ ] Check browser console for errors
- [ ] Verify SESSION_SECRET is set (32+ characters)
- [ ] Clear browser cache and cookies
- [ ] Check database tables were created

If pages return 404:
- [ ] Verify `.htaccess` file exists in `public/` folder
- [ ] Check Apache mod_rewrite is enabled
- [ ] Confirm Application URL is set correctly
- [ ] Check file permissions

## Important Notes

### Default Admin Credentials:
```
Username: admin
Password: admin123
```
**⚠️ MUST CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN**

### Required Environment Variables (Minimum):
1. DATABASE_URL
2. PGUSER
3. PGPASSWORD
4. PGDATABASE
5. PGHOST
6. PGPORT
7. SESSION_SECRET (32+ chars)
8. NODE_ENV (production)
9. PORT (5000 or assigned)

### Security Best Practices:
✅ Use strong passwords  
✅ Enable HTTPS/SSL  
✅ Regular backups  
✅ Monitor logs  
✅ Update dependencies regularly  
✅ Never share credentials  

### Support Resources:
- Application README.md
- cPanel documentation
- Hosting provider support
- PostgreSQL documentation
- Node.js documentation

---

## Deployment Status

**Deployment Date**: `_______________`  
**Domain**: `_______________`  
**Node.js Version**: `_______________`  
**Database**: `_______________`  
**Deployed By**: `_______________`  

**Status**: [ ] Successfully Deployed  

---

*Keep this checklist for reference and future deployments.*
