# 🔧 Fix: Vite Package Not Found Error

## ❌ Error Message:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' 
imported from /home/sociala1/crm.socialads.expert/index.js
```

---

## ✅ সমাধান (Simple Fix):

### সমস্যা কি?
Production build এ vite configuration included আছে, তাই সব dependencies install করতে হবে।

### Fix: `--production` flag ছাড়া Install করুন

**আগে বলেছিলাম:**
```bash
npm install --production  # ❌ এটা দিয়ে হবে না
```

**এখন করুন:**
```bash
npm install  # ✅ সব dependencies install হবে
```

---

## 🚀 Complete Fix Steps (Copy-Paste Ready):

### Terminal এ এই commands run করুন:

```bash
# 1. App directory তে যান
cd ~/crm.socialads.expert

# 2. Virtual Environment Activate করুন
source /home/sociala1/nodevenv/crm.socialads.expert/22/bin/activate

# অথবা যদি Node 20 use করছেন:
source /home/sociala1/nodevenv/crm.socialads.expert/20/bin/activate

# 3. Node version check করুন
node --version

# 4. পুরানো installations মুছুন
rm -rf node_modules
rm -f package-lock.json

# 5. সব dependencies install করুন (--production ছাড়া)
npm install

# 6. Verify করুন vite installed হয়েছে
npm list vite
# Should show: vite@5.4.20

# 7. Test করুন
npm start
```

যদি কোনো error না আসে, **Ctrl+C** press করুন।

---

## 🔄 cPanel থেকে Restart:

```
cPanel → Setup Node.js App → Restart App
```

---

## ✅ Verification:

### Check All Required Packages:
```bash
npm list --depth=0 | grep -E 'vite|@neondatabase|drizzle-orm|express'
```

**Expected Output:**
```
├── @neondatabase/serverless@0.10.4
├── drizzle-orm@0.39.3
├── express@4.21.2
├── vite@5.4.20
├── @vitejs/plugin-react@4.7.0
```

---

## 📝 Why This Happens:

**Build Configuration:**
- Production build (`index.js`) এ vite config included আছে
- `npm install --production` শুধু dependencies install করে
- devDependencies (vite, typescript, etc.) skip করে
- কিন্তু এই build এর জন্য সব packages লাগে

**Solution:**
- সব dependencies install করতে হবে
- `--production` flag use করবেন না

---

## 🎯 Your Specific Commands:

**For Node v22:**
```bash
cd ~/crm.socialads.expert && \
source /home/sociala1/nodevenv/crm.socialads.expert/22/bin/activate && \
rm -rf node_modules package-lock.json && \
npm install && \
npm list vite
```

**For Node v20:**
```bash
cd ~/crm.socialads.expert && \
source /home/sociala1/nodevenv/crm.socialads.expert/20/bin/activate && \
rm -rf node_modules package-lock.json && \
npm install && \
npm list vite
```

---

## 🔍 Troubleshooting:

### যদি npm install এ error আসে:

**Error: EACCES permission denied**
```bash
chmod -R 755 ~/crm.socialads.expert
npm cache clean --force
npm install
```

**Error: Network timeout**
```bash
npm config set registry https://registry.npmjs.org/
npm install --verbose
```

**Error: Disk space**
```bash
df -h  # Check disk space
npm cache clean --force
npm install
```

---

## 📋 Complete Checklist:

- [ ] Terminal open করেছেন
- [ ] App directory তে গেছেন
- [ ] Virtual environment activate করেছেন
- [ ] node_modules delete করেছেন
- [ ] `npm install` করেছেন (without --production)
- [ ] vite package verify করেছেন
- [ ] @neondatabase/serverless verify করেছেন
- [ ] App restart করেছেন
- [ ] Browser এ test করেছেন

---

## ✅ Expected Result:

```
✓ All dependencies installed (including devDependencies)
✓ vite@5.4.20 found
✓ @neondatabase/serverless@0.10.4 found
✓ App starts without errors
✓ https://crm.socialads.expert loads successfully
```

---

## 💡 Future Deployments:

**Remember:** এই build এর জন্য:
```bash
npm install  # ✅ Correct
```

**NOT:**
```bash
npm install --production  # ❌ Don't use this
```

---

**এই fix apply করলেই সব ঠিক হবে!** ✨
