# 🔧 Troubleshooting Guide Index

## 📚 সব সমস্যার সমাধান এক জায়গায়

---

## 🚨 Most Common Issues (প্রথমে এগুলো দেখুন):

### 1. ❌ Module Not Found Error
**Error:**
```
Cannot find package '@neondatabase/serverless'
```

**Solutions:**
- 🏃 **Quick Fix (2 min):** `QUICK-FIX.md`
- 📖 **Detailed Guide:** `FIX-MODULE-NOT-FOUND.md`
- 💡 **Root Cause:** npm dependencies properly install হয়নি

---

### 2. ❌ Database Permission Error
**Error:**
```
permission denied for table/schema
```

**Solutions:**
- 📖 **Guide 1:** `PERMISSION-FIX-GUIDE.md`
- 📖 **Guide 2:** `PERMISSION-ERROR-SOLUTION.md`
- 🔧 **SQL Script:** `fix-permissions.sql`
- 🛠️ **Manual Fix:** `fix-permissions-manual.sql`

---

### 3. ❌ Application Won't Start
**Symptoms:**
- App shows "Stopped" status
- Error in logs
- Website না খুলছে

**Solutions:**
1. Check error logs: cPanel → Node.js App → Logs
2. Verify environment variables set আছে
3. Database connection test করুন
4. `FIX-MODULE-NOT-FOUND.md` follow করুন

---

### 4. ❌ Database Connection Failed
**Error:**
```
connection refused / ECONNREFUSED
```

**Solutions:**
1. PostgreSQL running আছে কিনা check করুন
2. Database credentials verify করুন
3. Environment variables check করুন:
   - DATABASE_URL
   - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

---

## 📋 All Available Guides:

### 🚀 Deployment Guides:
1. **START-HERE.md** - Quick overview & common errors
2. **DEPLOY-NOW.md** - Complete step-by-step deployment
3. **QUICK-START.md** - 5-minute quick deployment
4. **DEPLOYMENT-SUMMARY.md** - Technical summary

### 🔧 Fix Guides:
5. **QUICK-FIX.md** - Fast 2-minute module fix
6. **FIX-MODULE-NOT-FOUND.md** - Complete module error solutions
7. **PERMISSION-FIX-GUIDE.md** - Database permission fixes
8. **PERMISSION-ERROR-SOLUTION.md** - Alternative permission solutions
9. **URGENT-FIX.md** - Critical fixes

### 📚 Reference:
10. **README-BANGLA.md** - Complete documentation
11. **WHATS-NEW.md** - Latest features
12. **DEPLOYMENT-CHECKLIST.md** - Pre/post deployment checks

### 🗄️ Database:
13. **database-schema.sql** - Full schema reference
14. **fix-permissions.sql** - Auto permission fix
15. **fix-permissions-manual.sql** - Manual permission fix
16. **setup-database.js** - Auto database setup

---

## 🎯 সমস্যা অনুযায়ী Guide:

### যদি App Install করতে সমস্যা হয়:
→ `DEPLOY-NOW.md` → Step 2 & 3

### যদি Module Error আসে:
→ `QUICK-FIX.md` → 2 minutes
→ `FIX-MODULE-NOT-FOUND.md` → Detailed

### যদি Database Error হয়:
→ `PERMISSION-FIX-GUIDE.md`
→ `setup-database.js` run করুন

### যদি App Start না হয়:
→ Error logs check করুন
→ `FIX-MODULE-NOT-FOUND.md` try করুন
→ Environment variables verify করুন

### যদি Website না খুলে:
→ App running আছে কিনা check করুন
→ Port settings verify করুন
→ Error logs দেখুন

### যদি PDF Download না করে:
→ Browser cache clear করুন
→ Console errors check করুন (F12)
→ Different browser try করুন

---

## ⚡ Quick Command Reference:

### App Directory তে যাওয়া:
```bash
cd ~/your-app-directory
```

### Virtual Environment Activate:
```bash
source /home/USERNAME/nodevenv/DOMAIN/22/bin/activate
```

### Dependencies Reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --production
```

### Database Setup:
```bash
node setup-database.js
```

### App Start/Stop:
```
cPanel → Setup Node.js App → Start/Stop/Restart
```

### Check Logs:
```
cPanel → Setup Node.js App → View Logs
```

---

## 🔍 Debugging Steps:

### 1. Check App Status:
```
cPanel → Setup Node.js App → Check status
```

### 2. View Error Logs:
```
cPanel → Setup Node.js App → Logs button
```

### 3. Check Dependencies:
```bash
cd ~/your-app-directory
npm list --depth=0
```

### 4. Test Database:
```bash
node setup-database.js
```

### 5. Check Environment:
```bash
env | grep PG
env | grep DATABASE
```

### 6. Manual Start (Debug):
```bash
npm start
# See errors directly
```

---

## 📞 Support Flow:

```
Error দেখলে
    ↓
Error message note করুন
    ↓
এই index থেকে relevant guide খুঁজুন
    ↓
Guide follow করুন
    ↓
Still problem?
    ↓
Error logs collect করুন
    ↓
Check database status
    ↓
Verify environment variables
```

---

## ✅ Common Solutions Summary:

| Error Type | Quick Fix | Detailed Guide |
|------------|-----------|----------------|
| Module not found | `QUICK-FIX.md` | `FIX-MODULE-NOT-FOUND.md` |
| Permission denied | Run `fix-permissions.sql` | `PERMISSION-FIX-GUIDE.md` |
| App won't start | Check logs, reinstall deps | `DEPLOY-NOW.md` |
| Database error | Run `setup-database.js` | `PERMISSION-ERROR-SOLUTION.md` |
| Connection failed | Check env vars | `DEPLOY-NOW.md` Step 3 |
| PDF not working | Clear cache | `WHATS-NEW.md` |

---

## 🎯 Your Specific Setup (Based on Error Log):

**Username:** `sociala1`  
**Domain:** `crm.socialads.expert`  
**Node Version:** `22`  
**App Path:** `~/crm.socialads.expert`

**Virtual Environment:**
```bash
/home/sociala1/nodevenv/crm.socialads.expert/22/bin/activate
```

**Your Quick Fix Command:**
```bash
cd ~/crm.socialads.expert && \
source /home/sociala1/nodevenv/crm.socialads.expert/22/bin/activate && \
rm -rf node_modules package-lock.json && \
npm install --production
```

---

## 🚀 After Fixing:

1. ✅ Restart app in cPanel
2. ✅ Check logs for errors
3. ✅ Test in browser
4. ✅ Verify all features working

---

**সব guide এখানে আছে - নির্দিষ্ট সমস্যার জন্য সঠিক guide follow করুন!** ✨
