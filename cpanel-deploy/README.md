# 🚀 cPanel Deployment Guide - Social Ads Expert CRM

## ⚠️ Important: Latest Error Fix

**যদি এই error দেখেন:**
```
Error: Cannot find package 'vite'
```

**Solution:** `YOUR-ERROR-SOLUTION.md` এবং `FIX-VITE-ERROR.md` দেখুন

**Quick Fix:**
```bash
cd ~/crm.socialads.expert
source /home/sociala1/nodevenv/crm.socialads.expert/20/bin/activate
rm -rf node_modules package-lock.json
npm install  # WITHOUT --production flag!
```

---

## 📦 Package Contents:

- ✅ `index.js` (110KB) - Production server
- ✅ `public/` - Frontend build
- ✅ `package.json` - Dependencies list
- ✅ `setup-database.js` - Database auto-setup
- ✅ `fix-permissions.sql` - Permission fixes
- ✅ Documentation guides

---

## 🎯 Quick Deployment (5 Steps):

### Step 1: Upload Files
1. ZIP this `cpanel-deploy` folder
2. Upload to cPanel File Manager
3. Extract in your app directory (e.g., `~/crm.socialads.expert`)

### Step 2: Setup Node.js App
**cPanel → Setup Node.js App → Create Application**

**Configuration:**
```
Node.js Version: 20.x or 22.x
Application Mode: Production
Application Root: ~/crm.socialads.expert
Application URL: crm.socialads.expert (your domain)
Application Startup File: index.js
```

### Step 3: Set Environment Variables
Add these in cPanel Node.js App:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
PGUSER=your_database_username
PGPASSWORD=your_database_password
PGDATABASE=your_database_name
PGHOST=localhost
PGPORT=5432
NODE_ENV=production
PORT=5000
SESSION_SECRET=<generate-random-32-chars>
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Install Dependencies & Setup Database

**Terminal এ যান এবং run করুন:**

```bash
# Navigate to app directory
cd ~/crm.socialads.expert

# Activate Node.js virtual environment
source /home/sociala1/nodevenv/crm.socialads.expert/20/bin/activate

# Install ALL dependencies (NO --production flag!)
npm install

# Setup database
node setup-database.js
```

**⚠️ Critical:** `npm install` করুন **without** `--production` flag!

### Step 5: Start App

**cPanel → Setup Node.js App → Start App**

Wait for status to show "Running"

---

## ✅ Verification:

### 1. Check Browser:
```
https://crm.socialads.expert
```

You should see the login page.

### 2. Login:
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Change password immediately after first login!**

### 3. Test Features:
- Dashboard loads
- Project Management → সম্পূর্ণ ওয়েবসাইট তালিকা section visible
- Can add website credentials
- PDF download works

---

## 🔧 Common Errors & Fixes:

### Error 1: "Cannot find package 'vite'"
**Fix:** `YOUR-ERROR-SOLUTION.md` বা `FIX-VITE-ERROR.md`

**Quick Solution:**
```bash
npm install  # WITHOUT --production
```

### Error 2: "Cannot find package '@neondatabase/serverless'"
**Fix:** Same as above - run `npm install` without --production

### Error 3: Database Permission Error
**Fix:**
```bash
psql $DATABASE_URL < fix-permissions.sql
# অথবা
node setup-database.js
```

### Error 4: App Won't Start
**Debug:**
```bash
# Check logs
cPanel → Node.js App → View Logs

# Manual test
cd ~/crm.socialads.expert
npm start
```

---

## 📋 Deployment Checklist:

**Pre-Deployment:**
- [ ] cPanel access ready
- [ ] PostgreSQL database created
- [ ] Database credentials ready
- [ ] Files uploaded and extracted

**Installation:**
- [ ] Node.js app configured in cPanel
- [ ] Environment variables set
- [ ] npm install completed (without --production)
- [ ] Database setup run successfully

**Verification:**
- [ ] App status showing "Running"
- [ ] Website loads in browser
- [ ] Login works
- [ ] Dashboard displays
- [ ] All features accessible

---

## 🗂️ Folder Structure (After Deploy):

```
~/crm.socialads.expert/
├── index.js                    # Main server
├── public/                     # Frontend files
│   ├── index.html
│   └── assets/
│       ├── index-xxx.js       # JS bundle
│       └── index-xxx.css      # Styles
├── package.json
├── package-lock.json
├── node_modules/              # All dependencies
├── setup-database.js
└── fix-permissions.sql
```

---

## 🆘 Troubleshooting:

### Get Error Logs:
```
cPanel → Setup Node.js App → Your App → View Logs
```

### Manual Debugging:
```bash
# Check installation
cd ~/crm.socialads.expert
npm list vite
npm list @neondatabase/serverless

# Test database connection
node setup-database.js

# Test app startup
npm start
```

### Clear and Reinstall:
```bash
cd ~/crm.socialads.expert
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 💡 Important Notes:

### 1. Always Install ALL Dependencies:
```bash
npm install  # ✅ Correct
```

**NOT:**
```bash
npm install --production  # ❌ Will cause errors!
```

**Why?** This build includes development dependencies (vite, typescript) in the runtime.

### 2. Node Version:
Use Node.js v20 or v22. Error logs show you're using v20.19.4.

### 3. Virtual Environment:
Always activate before running npm commands:
```bash
source /home/sociala1/nodevenv/crm.socialads.expert/20/bin/activate
```

---

## 🆕 Latest Features Included:

### Completed Websites Management:
- Store website + cPanel credentials
- Nameserver configuration
- Service provider tracking
- Professional PDF download
- Search & filter functionality

**Location:** Project Management → সম্পূর্ণ ওয়েবসাইট তালিকা

---

## 📞 Need Help?

**Guides Available:**
1. `YOUR-ERROR-SOLUTION.md` - Your specific errors with exact paths
2. `FIX-VITE-ERROR.md` - Vite package error detailed fix

**Debug Steps:**
1. Check error logs in cPanel
2. Run `npm install` (without --production)
3. Run `node setup-database.js`
4. Restart app in cPanel
5. Test in browser

---

## ✅ Success Indicators:

```
✓ npm install completes without errors
✓ vite@5.4.20 installed
✓ @neondatabase/serverless@0.10.4 installed
✓ Database setup successful
✓ App status: Running
✓ Website loads: https://crm.socialads.expert
✓ Login works
✓ All features accessible
```

---

## 🎉 Ready to Deploy!

Follow the 5 steps above and your app will be live!

**Good luck! 🚀**
