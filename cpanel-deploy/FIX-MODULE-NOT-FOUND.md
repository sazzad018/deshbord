# 🔧 Fix: Module Not Found Error

## ❌ Error যা দেখাচ্ছে:

```
Error: Cannot find package '@neondatabase/serverless/index.js'
imported from drizzle-orm/neon-http/driver.js
```

**কারণ:** npm dependencies properly install হয়নি cPanel এ।

---

## ✅ Solution - Step by Step

### Method 1: cPanel Node.js App থেকে Fix করুন (Recommended)

#### Step 1: Stop App
1. cPanel → **Setup Node.js App**
2. আপনার app select করুন
3. **Stop App** button এ click করুন

#### Step 2: Clear node_modules
Terminal এ যান এবং run করুন:
```bash
cd ~/your-app-directory
rm -rf node_modules
rm -f package-lock.json
```

#### Step 3: Reinstall Dependencies
**Option A: cPanel UI থেকে (সবচেয়ে সহজ)**
1. Setup Node.js App পেজে ফিরে যান
2. **Run NPM Install** button এ click করুন
3. Installation complete হওয়া পর্যন্ত অপেক্ষা করুন

**Option B: Terminal থেকে**
```bash
cd ~/your-app-directory

# Make sure you're using the correct Node version
source /home/YOUR_USERNAME/nodevenv/your-app-path/22/bin/activate

# Install dependencies
npm install --production
```

**⚠️ Important:** `YOUR_USERNAME` এবং `your-app-path` আপনার actual path দিয়ে replace করুন।

#### Step 4: Verify Installation
Check করুন @neondatabase/serverless installed হয়েছে কিনা:
```bash
ls -la node_modules/@neondatabase/
```

**Expected Output:**
```
drwxr-xr-x  serverless/
```

#### Step 5: Start App
1. Setup Node.js App পেজে ফিরে যান
2. **Start App** অথবা **Restart App** click করুন
3. Status **Running** হওয়া পর্যন্ত wait করুন

---

### Method 2: Manual Terminal Installation

যদি Method 1 কাজ না করে, এই method try করুন:

```bash
# 1. App directory তে যান
cd ~/your-app-directory

# 2. Virtual environment activate করুন
source /home/YOUR_USERNAME/nodevenv/YOUR_DOMAIN/22/bin/activate

# 3. Node and npm version check করুন
node --version  # Should be v22.x.x
npm --version

# 4. Clear everything
rm -rf node_modules package-lock.json

# 5. Install all dependencies
npm install

# 6. Verify critical packages
npm list @neondatabase/serverless
npm list drizzle-orm
npm list express

# 7. Start the app
npm start
```

---

### Method 3: Package-by-Package Install (যদি সব method fail করে)

```bash
# Activate environment
source /home/YOUR_USERNAME/nodevenv/YOUR_DOMAIN/22/bin/activate

# Install critical packages manually
npm install @neondatabase/serverless
npm install drizzle-orm
npm install express
npm install postgres

# Then install rest
npm install
```

---

## 🔍 Troubleshooting

### Issue 1: "Permission Denied"
```bash
# Fix permissions
chmod -R 755 ~/your-app-directory
chown -R YOUR_USERNAME:YOUR_USERNAME ~/your-app-directory
```

### Issue 2: "EACCES" Error
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install --production
```

### Issue 3: Wrong Node Version
```bash
# Check current version
node --version

# If wrong, activate correct environment
source /home/YOUR_USERNAME/nodevenv/YOUR_DOMAIN/22/bin/activate

# Verify
node --version  # Should show v22.x.x
```

### Issue 4: Path Issues
Virtual environment path format:
```
/home/USERNAME/nodevenv/DOMAIN_OR_SUBDOMAIN/NODE_VERSION/bin/activate
```

**Examples:**
```bash
# Main domain
source /home/sociala1/nodevenv/socialads.expert/22/bin/activate

# Subdomain
source /home/sociala1/nodevenv/crm.socialads.expert/22/bin/activate
```

---

## ✅ Verification Steps

### 1. Check Dependencies:
```bash
cd ~/your-app-directory
npm list --depth=0
```

**Should show:**
- ✅ @neondatabase/serverless
- ✅ drizzle-orm
- ✅ express
- ✅ postgres
- ✅ (and other packages)

### 2. Test the App:
```bash
# Try to start manually
npm start
```

**Expected:** Server starts without errors

### 3. Check Browser:
```
https://yourdomain.com
```

**Expected:** App loads successfully

---

## 📋 Complete Fix Checklist

- [ ] Stop the app
- [ ] Delete node_modules and package-lock.json
- [ ] Activate correct Node.js virtual environment
- [ ] Run npm install
- [ ] Verify @neondatabase/serverless is installed
- [ ] Verify drizzle-orm is installed
- [ ] Start the app
- [ ] Check error logs
- [ ] Test in browser

---

## 🚨 Still Not Working?

### Debug Information to Collect:

**1. Check Node Version:**
```bash
node --version
npm --version
```

**2. Check Install Path:**
```bash
pwd
ls -la
```

**3. Check Environment:**
```bash
env | grep NODE
env | grep PATH
```

**4. Check Error Logs:**
```bash
# In cPanel
Setup Node.js App → Your App → View Logs

# Or terminal
pm2 logs  # if using pm2
npm start  # to see direct errors
```

**5. Verify package.json:**
```bash
cat package.json | grep -A 5 dependencies
```

---

## 💡 Common Causes & Solutions:

| Problem | Cause | Solution |
|---------|-------|----------|
| Module not found | npm install failed | Delete node_modules, reinstall |
| Wrong Node version | Environment not activated | Activate virtual env |
| Permission denied | File permissions | Fix with chmod/chown |
| Path errors | Wrong directory | cd to correct app path |
| Cache issues | Corrupted npm cache | Clear cache, reinstall |

---

## 🎯 Quick Fix Command (One-liner):

```bash
cd ~/your-app-directory && source /home/YOUR_USERNAME/nodevenv/YOUR_DOMAIN/22/bin/activate && rm -rf node_modules package-lock.json && npm install --production && npm start
```

**⚠️ Replace:**
- `YOUR_USERNAME` → আপনার cPanel username
- `YOUR_DOMAIN` → আপনার domain/subdomain

---

## ✅ Expected Result:

After successful fix:
```
✓ @neondatabase/serverless installed
✓ All dependencies installed
✓ App starts without errors
✓ Website loads in browser
✓ No module errors in logs
```

---

## 📞 Need More Help?

1. Check cPanel error logs thoroughly
2. Verify database connection settings
3. Ensure PostgreSQL is running
4. Check environment variables are set correctly

**এই fix apply করার পর app চলা উচিত!** ✨
