# 🚀 Social Ads Expert - cPanel Deployment Ready!

## ✅ Deployment Package Status: READY

Your Social Ads Expert CRM application is now fully prepared for cPanel deployment!

---

## 📦 What's Included

### 1. Deployment Package
- **File**: `social-ads-expert-cpanel.tar.gz` (731 KB)
- **Location**: Root directory of this project
- **Contents**: Complete production-ready application

### 2. Package Contents:
```
cpanel-deploy/
├── index.js                      # Bundled Node.js server (68 KB)
├── setup-database.js             # Database setup script ⭐ NEW!
├── package.json                  # Production dependencies
├── .env.example                  # Environment variables template
├── README.md                     # Comprehensive deployment guide
├── DEPLOYMENT-CHECKLIST.md       # Step-by-step checklist
└── public/                       # React frontend (built)
    ├── index.html               # Main HTML file
    ├── .htaccess                # React routing support
    └── assets/                  # Compiled CSS & JS (2.5 MB)
```

---

## 🔐 Default Admin Credentials

**IMPORTANT - Save These Credentials:**
```
Username: admin
Password: admin123
```

⚠️ **Security Alert**: Change password immediately after first login!

---

## 🎯 Quick Deployment Steps

### 1. Extract Package (YOUR COMPUTER)
```bash
tar -xzf social-ads-expert-cpanel.tar.gz
```

### 2. Create ZIP for Upload
Create a ZIP file of all contents inside `cpanel-deploy/` folder for upload to cPanel.

### 3. Upload to cPanel
- Login to your cPanel
- Use File Manager
- Upload and extract in your Node.js app directory

### 4. Configure in cPanel
- Setup Node.js App (version 18+)
- Set environment variables (see .env.example)
- Run NPM Install

### 5. Setup Database Tables ⚠️ CRITICAL
**MUST run before starting the app!**
```bash
node setup-database.js
```
This creates all database tables automatically.

### 6. Start & Login
- Start the Node.js application in cPanel
- Visit your domain
- Login with admin/admin123
- **Immediately change password**

---

## 📚 Documentation Files

1. **README.md** (Inside cpanel-deploy/)
   - Complete deployment guide
   - Troubleshooting section
   - Security best practices
   - Feature overview

2. **DEPLOYMENT-CHECKLIST.md** (Inside cpanel-deploy/)
   - Step-by-step checklist
   - Pre-deployment preparation
   - Post-deployment verification
   - Fillable form fields

3. **.env.example** (Inside cpanel-deploy/)
   - All required environment variables
   - Example values
   - Security notes
   - Admin login credentials

4. **cpanel-deployment-guide.md** (Root directory)
   - Bengali/English bilingual guide
   - Detailed cPanel instructions
   - Troubleshooting tips

---

## ⚙️ Required Environment Variables

Set these in cPanel Node.js App settings:

### Database (PostgreSQL):
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=your_database
PGHOST=localhost
PGPORT=5432
```

### Application:
```bash
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-32-character-secret-key
```

**Generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎨 Application Features

### ✅ Admin Panel (Protected):
- Bengali language interface
- Client management with "বড়লোক ক্লাইন্ট" categorization
- Financial tracking (deposits, spending, wallet)
- Dual currency support (USD/BDT)
- Project management with employee assignments
- Meeting scheduling with reminders
- AI-powered query system
- Export to PDF/Excel

### ✅ Public Portals (No Login Required):
- Client Portal (unique portal key access)
- Employee Portal (project tracking)

### ✅ Authentication System:
- Secure bcrypt password hashing
- Session-based authentication
- 24-hour session duration
- HTTP-only cookies
- Protected admin routes

---

## 🛡️ Security Checklist

- [ ] Change admin password after first login
- [ ] Use strong database passwords
- [ ] Generate secure SESSION_SECRET (32+ characters)
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up regular database backups
- [ ] Monitor application logs
- [ ] Keep environment variables secure

---

## 📋 Deployment Checklist

1. [ ] Extract deployment package
2. [ ] Create PostgreSQL database in cPanel
3. [ ] Note database credentials
4. [ ] Generate SESSION_SECRET
5. [ ] Upload files to cPanel
6. [ ] Configure Node.js App (v18+, Production mode)
7. [ ] Set all environment variables
8. [ ] Run NPM Install
9. [ ] Start application
10. [ ] Test admin login
11. [ ] **Change admin password**
12. [ ] Enable HTTPS/SSL
13. [ ] Set up backups

---

## 🔧 Technical Specifications

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (with Drizzle ORM)
- **Authentication**: bcrypt + express-session
- **Node.js Version**: 18 or higher required
- **Port**: 5000 (configurable)

---

## 📞 Support Resources

### Documentation:
1. `cpanel-deploy/README.md` - Full deployment guide
2. `cpanel-deploy/DEPLOYMENT-CHECKLIST.md` - Interactive checklist
3. `cpanel-deployment-guide.md` - Bengali/English guide

### If You Encounter Issues:
1. Check Node.js app logs in cPanel
2. Verify all environment variables are set
3. Confirm database connection details
4. Review troubleshooting section in README.md
5. Contact your hosting provider for server issues

---

## ✨ What's New in This Version

### Authentication System:
- ✅ Secure admin login with bcrypt
- ✅ Session management (24-hour sessions)
- ✅ Protected admin routes
- ✅ Beautiful Bengali login interface
- ✅ Default admin account (admin/admin123)

### Deployment Ready:
- ✅ Production build optimized
- ✅ All dependencies bundled
- ✅ Environment variables documented
- ✅ Comprehensive deployment guides
- ✅ Step-by-step checklist
- ✅ Security best practices

---

## 🎉 Next Steps

1. **Review Documentation**
   - Read `cpanel-deploy/README.md`
   - Go through `DEPLOYMENT-CHECKLIST.md`

2. **Prepare Hosting**
   - Ensure Node.js 18+ available
   - Create PostgreSQL database
   - Get SSL certificate ready

3. **Deploy**
   - Follow the deployment checklist
   - Set environment variables carefully
   - Test thoroughly after deployment

4. **Secure**
   - Change admin password immediately
   - Enable HTTPS
   - Set up backups

5. **Train Users**
   - Document your specific configuration
   - Train team members on the system
   - Set up monitoring

---

## 📊 Package Statistics

- **Total Package Size**: 731 KB (compressed)
- **Frontend Assets**: 2.5 MB (uncompressed)
- **Backend Bundle**: 68 KB
- **Database Setup Script**: 14 KB ⭐ NEW!
- **Total Files**: 9 files + assets
- **Node.js Version Required**: 18+
- **Dependencies**: 10 production packages

---

## 🌟 Production Ready

This application is production-ready with:
- ✅ Optimized build
- ✅ Secure authentication
- ✅ Error handling
- ✅ Database migrations
- ✅ Session management
- ✅ React routing support
- ✅ Bengali language support
- ✅ Responsive design

---

## 📝 Important Notes

1. **Admin Credentials**: Default username is `admin`, password is `admin123`
2. **Password Change**: MUST change password after first login
3. **Session Secret**: Generate a unique 32+ character secret
4. **Database**: PostgreSQL required, tables auto-create on first run
5. **SSL**: Highly recommended for production
6. **Backups**: Set up regular database backups
7. **Monitoring**: Check logs regularly for any issues

---

## 🚀 Ready to Deploy!

Your Social Ads Expert CRM is ready for cPanel deployment. Follow the guides and checklists provided, and you'll have your application running in production in no time!

**Good luck with your deployment! 🎊**

---

**Version**: 1.0.0  
**Build Date**: September 30, 2025  
**Framework**: React + Node.js + Express + PostgreSQL  
**Language**: Bengali (বাংলা) + English
