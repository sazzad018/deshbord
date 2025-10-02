# 🎯 Social Ads Expert CRM - cPanel Deployment Package

## ✅ সব কিছু Ready!

এই package এ সব latest features সহ production-ready build আছে।

---

## 📋 Package Contents:

### Core Files:
- ✅ `index.js` - Production server (optimized)
- ✅ `public/` - Frontend build (compressed & minified)
- ✅ `package.json` + `package-lock.json` - Dependencies
- ✅ `setup-database.js` - Database initialization
- ✅ `database-schema.sql` - SQL reference

### Documentation:
1. 🚀 **START-HERE.md** - শুরু করুন এখান থেকে
2. 📖 **DEPLOY-NOW.md** - Complete deployment guide
3. 🆕 **WHATS-NEW.md** - নতুন features
4. ⚡ **QUICK-START.md** - Quick deployment

---

## 🆕 Latest Features (October 2, 2025):

### 1. Completed Websites Management System
**Location:** Project Management → সম্পূর্ণ ওয়েবসাইট তালিকা

#### Features:
- ✅ Website Admin Credentials Storage
- ✅ cPanel Login Storage  
- ✅ Nameserver Configuration (NS1/NS2)
- ✅ Service Provider Tracking
- ✅ Project Notes & Dates
- ✅ Password Show/Hide Toggle
- ✅ Search & Filter

### 2. Professional PDF Download
- ✅ Automatic Download (no print dialog)
- ✅ Colorful Gradient Design
- ✅ Multi-page Support
- ✅ High Resolution Output
- ✅ Brand Color Scheme

---

## 🚀 Quick Deploy (3 Steps):

### Step 1: Upload
```bash
# ZIP this folder
# Upload to cPanel File Manager
# Extract in your app directory
```

### Step 2: Setup
```bash
# cPanel Terminal:
cd ~/your-app-directory
npm install --production
node setup-database.js
```

### Step 3: Configure & Start
```
cPanel → Setup Node.js App
- Node version: 18+
- Startup file: index.js
- Set environment variables
- Click "Start App"
```

---

## ⚙️ Environment Variables:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=your_database
PGHOST=localhost
PGPORT=5432
NODE_ENV=production
PORT=5000
SESSION_SECRET=random-32-char-string
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 Technical Details:

**Build Info:**
- Node.js: 18+
- Frontend: React + Vite (optimized)
- Backend: Express + TypeScript
- Database: PostgreSQL
- PDF: jsPDF + html2canvas
- UI: TailwindCSS + shadcn/ui

**Size:**
- Frontend: 2.6 MB (minified)
- Backend: 110 KB
- Total: ~3.1 MB

**Performance:**
- Production mode ✅
- Gzip compression ✅
- Code splitting ✅
- Lazy loading ✅

---

## ✅ Deployment Checklist:

**Pre-Deployment:**
- [ ] cPanel access ready
- [ ] PostgreSQL database created
- [ ] Database credentials ready
- [ ] Domain/subdomain configured

**Deployment:**
- [ ] Files uploaded
- [ ] npm install completed
- [ ] Database setup done
- [ ] Environment variables set
- [ ] App started successfully

**Post-Deployment:**
- [ ] Website loading
- [ ] Login working
- [ ] All pages accessible
- [ ] New features verified
- [ ] PDF download tested

---

## 🎯 Default Credentials:

**Admin Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** First login এর পর password change করুন!

---

## 🔧 Troubleshooting:

### App না চললে:
1. Environment variables check করুন
2. Database connection verify করুন
3. Error logs দেখুন: cPanel → Node.js App → Logs

### Database error হলে:
```bash
node setup-database.js
```

### PDF download না হলে:
1. Browser cache clear করুন
2. Console error check করুন (F12)
3. অন্য browser এ test করুন

---

## 📞 Support Files:

- **Deployment Guide:** `DEPLOY-NOW.md`
- **Feature List:** `WHATS-NEW.md`
- **Quick Start:** `QUICK-START.md`
- **Permission Fix:** `PERMISSION-FIX-GUIDE.md`

---

## ✨ Ready to Deploy!

**Next Step:** `START-HERE.md` open করুন এবং follow করুন।

**All the best! 🚀**

---

## 📝 Notes:

- ✅ All features tested and working
- ✅ Production build optimized
- ✅ Database migration included
- ✅ Security best practices followed
- ✅ Mobile responsive
- ✅ Cross-browser compatible

**Deploy করুন confidence এর সাথে!** 🎊
