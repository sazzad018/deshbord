# 🚀 Quick Start Guide

## 5-Minute Deployment to cPanel

### ⚡ Prerequisites Checklist
- [ ] cPanel with Node.js 18+ support
- [ ] PostgreSQL database created
- [ ] Database credentials ready
- [ ] SSL certificate (recommended)

---

## 📝 Step-by-Step

### 1️⃣ Upload Files (2 min)
```bash
# Extract the package
tar -xzf social-ads-expert-cpanel.tar.gz

# Create ZIP of cpanel-deploy folder
# Upload ZIP to cPanel File Manager
# Extract in your app directory
```

### 2️⃣ Configure Node.js App (1 min)
- Node.js version: **18+**
- Application mode: **Production**
- Startup file: **index.js**
- Run NPM Install ✅

### 3️⃣ Set Environment Variables (1 min)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=your_database
PGHOST=localhost
PGPORT=5432
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-32-char-secret
```

💡 Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4️⃣ Create Database Tables (30 sec) ⚠️
**CRITICAL - Must do before starting app!**
```bash
node setup-database.js
```

Wait for: ✅ Database setup completed successfully!

### 5️⃣ Start Application (30 sec)
- Click **START** in cPanel
- Wait for **Running** status
- Visit your domain

### 6️⃣ Login & Secure (30 sec)
```
Username: admin
Password: admin123
```
**🔒 CHANGE PASSWORD IMMEDIATELY!**

---

## ⚠️ Common Issues

### "Database tables not found"
→ You forgot step 4! Run `node setup-database.js`

### App won't start
→ Check Node.js version is 18+
→ Verify all environment variables are set

### Login doesn't work
→ Wait 2-3 minutes for initialization
→ Check SESSION_SECRET is 32+ characters
→ Clear browser cache

---

## ✅ Success Checklist

After deployment:
- [ ] App is running
- [ ] Can login with admin credentials
- [ ] Dashboard loads
- [ ] Changed admin password
- [ ] HTTPS enabled
- [ ] Database backup scheduled

---

## 📚 Full Documentation

- **README.md** - Complete deployment guide
- **DEPLOYMENT-CHECKLIST.md** - Detailed checklist
- **.env.example** - All environment variables

---

**Need Help?** Check the full README.md for troubleshooting tips!
