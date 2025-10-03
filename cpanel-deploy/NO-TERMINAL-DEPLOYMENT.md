# 🚀 Shared cPanel Deployment (Terminal ছাড়া)

## ✅ আপনার জন্য সহজ সমাধান!

**Good News:** Shared cPanel এ terminal ছাড়াই আপনি app deploy করতে পারবেন!

---

## 📦 Step 1: Files Upload করুন

### 1.1 ZIP File তৈরি করুন
আপনার local computer এ:
- `cpanel-deploy` folder টা ZIP করুন
- File name: `app.zip` (বা যেকোনো নাম)

### 1.2 cPanel File Manager এ Upload করুন

1. **cPanel Login করুন**
2. **Files → File Manager** open করুন
3. **Home Directory** তে যান
4. আপনার app এর জন্য নতুন folder তৈরি করুন:
   - **+ Folder** button click করুন
   - Name: `crm-app` (বা যেকোনো নাম, `public_html` ছাড়া)
   - **Create New Folder** click করুন

5. নতুন folder এ ঢুকুন (`crm-app`)

6. **Upload** button click করুন
   - আপনার `app.zip` file select করুন
   - Upload complete হওয়া পর্যন্ত wait করুন

7. Upload হওয়া ZIP file এ:
   - Right click করুন
   - **Extract** select করুন
   - Extract করা files গুলো move করুন main folder এ
   - ZIP file delete করুন

**Final Structure দেখতে হবে এমন:**
```
~/crm-app/
  ├── index.js
  ├── package.json
  ├── package-lock.json
  ├── public/
  ├── setup-database.js
  └── fix-permissions.sql
```

---

## ⚙️ Step 2: Node.js Application Setup করুন

### 2.1 Setup Node.js App Open করুন
1. cPanel dashboard এ ফিরে যান
2. **Software** section খুঁজুন
3. **Setup Node.js App** click করুন

### 2.2 Create Application

**Create Application** button এ click করুন এবং fill করুন:

```
Node.js Version: 20.19.4 (বা available latest version)
Application Mode: Production
Application Root: crm-app (আপনার folder name)
Application URL: crm.socialads.expert (আপনার domain)
Application Startup File: index.js
```

**⚠️ Important Notes:**
- **Application Root:** `public_html` এর বাইরে রাখুন (আপনি যে folder তৈরি করেছেন)
- **Application URL:** আপনার actual domain/subdomain দিন
- **Startup File:** Exactly `index.js` লিখুন

**Create** button click করুন।

---

## 🔧 Step 3: Environment Variables Set করুন

Application create হওয়ার পর, আপনি একটা form দেখবেন।

**Environment Variables** section এ scroll করুন এবং add করুন:

**Database Variables:**
```
DATABASE_URL = postgresql://username:password@localhost:5432/database_name
PGUSER = your_database_username
PGPASSWORD = your_database_password
PGDATABASE = your_database_name
PGHOST = localhost
PGPORT = 5432
```

**App Variables:**
```
NODE_ENV = production
PORT = 5000
SESSION_SECRET = [একটা random 32 character string]
```

### SESSION_SECRET Generate করুন:
যেহেতু terminal নেই, এই website ব্যবহার করুন:
1. Browser এ যান: `https://www.random.org/strings/`
2. অথবা এই randomly generated value use করুন:
   ```
   a7f3e9d2c8b6a4f1e5d3c9b7a5f2e8d6c4b2a9f7e5d3c1b9a7f5e3d1c9b7a5f3
   ```

**Save** অথবা **Update** button click করুন।

---

## 📥 Step 4: Dependencies Install করুন

এটাই সবচেয়ে **গুরুত্বপূর্ণ** step!

### 4.1 Run NPM Install
1. **Setup Node.js App** page এ আপনার app দেখবেন
2. আপনার app এর পাশে **Edit** icon (pencil ✏️) click করুন
3. নিচে scroll করুন
4. **Run NPM Install** button খুঁজুন
5. Click করুন এবং wait করুন

**⏳ Installation সময় লাগবে:** 5-15 minutes

**Progress দেখতে পাবেন:**
```
Installing dependencies...
[████████████████████] 100%
```

### 4.2 Verify Installation
Installation complete হলে page এ দেখবেন:
```
✓ Dependencies installed successfully
```

**⚠️ যদি error আসে:** নিচে Troubleshooting section দেখুন।

---

## 🗄️ Step 5: Database Setup করুন

### 5.1 PostgreSQL Database তৈরি করুন

**cPanel → Databases → PostgreSQL Databases**

1. **Create Database**
   - Database Name: `yourname_crm` (যেকোনো নাম)
   - Click **Create Database**

2. **Create User**
   - Username: `yourname_admin` (যেকোনো নাম)
   - Password: Strong password তৈরি করুন
   - Click **Create User**

3. **Add User to Database**
   - User: Select your created user
   - Database: Select your created database
   - Click **Add**
   - **All Privileges** select করুন
   - Click **Make Changes**

### 5.2 Database Setup Script Run করুন

যেহেতু terminal নেই, আমরা একটা workaround করব:

**Option A: Temporary Web Page তৈরি করুন**

1. File Manager এ যান → `crm-app` folder
2. একটা temporary file তৈরি করুন: `setup.js`
3. Content:
```javascript
import('./setup-database.js');
```

4. App startup file temporarily change করুন:
   - Setup Node.js App → Edit → Application Startup File: `setup.js`
   - Save করুন
   - App restart করুন (Stop → Start)

5. Browser এ আপনার domain visit করুন
   - Database setup automatically হবে

6. আবার change করুন:
   - Application Startup File: `index.js`
   - Save এবং Restart করুন

**Option B: File Manager দিয়ে SQL Execute করুন**

1. cPanel → phpPgAdmin (যদি available থাকে)
2. Your database select করুন
3. **SQL** tab এ যান
4. File Manager থেকে `fix-permissions.sql` file open করুন
5. Content copy করে phpPgAdmin এ paste করুন
6. **Execute** click করুন

---

## 🚀 Step 6: Application Start করুন

### 6.1 Start/Restart App

**Setup Node.js App** page এ:

1. আপনার app খুঁজুন
2. Status দেখবেন: **Stopped** অথবা **Running**
3. যদি Stopped থাকে: **Start** button click করুন
4. যদি Running থাকে: **Restart** button click করুন

**⏳ Wait করুন:** Status **Running** হওয়া পর্যন্ত (30-60 seconds)

### 6.2 Verify Running

Status যখন **Running** দেখাবে:
```
Status: ● Running
```

---

## ✅ Step 7: Test করুন

### 7.1 Browser এ Open করুন
```
https://crm.socialads.expert
```

(আপনার actual domain)

### 7.2 Login করুন
- **Username:** `admin`
- **Password:** `admin123`

### 7.3 Check Features
- ✅ Dashboard loads
- ✅ Project Management accessible
- ✅ সম্পূর্ণ ওয়েবসাইট তালিকা section দেখা যাচ্ছে
- ✅ Add website works
- ✅ PDF download works

---

## 🔧 Troubleshooting (Terminal ছাড়া)

### Problem 1: NPM Install Button কাজ করছে না

**Solution A: Node Version Change করুন**
1. Setup Node.js App → Edit
2. Node.js Version: একটা ভিন্ন version try করুন (18.x, 16.x)
3. Save এবং আবার Run NPM Install

**Solution B: File Manager দিয়ে**
1. আপনার local computer এ:
   - `cd cpanel-deploy`
   - `npm install` (local এ install করুন)
2. পুরো `node_modules` folder ZIP করুন
3. cPanel File Manager এ upload করুন
4. Extract করুন app directory তে
5. App restart করুন

### Problem 2: App Start হচ্ছে না

**Check Error Logs:**
1. Setup Node.js App → Your App
2. **View Logs** অথবা **Open** button পাশে log icon
3. Error message পড়ুন

**Common Fixes:**
- Environment variables check করুন
- Startup file name verify করুন: `index.js`
- Node version change করে try করুন

### Problem 3: Database Connection Error

**Verify Settings:**
1. Database name, username, password সঠিক কিনা
2. Environment variables এ correct values আছে কিনা
3. PostgreSQL service running আছে কিনা (cPanel এ check করুন)

### Problem 4: Website Load হচ্ছে না

**Check:**
1. App status **Running** আছে কিনা
2. Domain correctly configured আছে কিনা
3. Application URL সঠিক আছে কিনা
4. DNS propagation complete হয়েছে কিনা (24-48 hours লাগতে পারে)

---

## 📋 Complete Checklist (Terminal ছাড়া):

**File Upload:**
- [ ] ZIP file created
- [ ] Uploaded to cPanel File Manager
- [ ] Extracted in app folder (not public_html)
- [ ] Files structure verified

**Node.js App Setup:**
- [ ] Application created in cPanel
- [ ] Node version selected (20.x)
- [ ] Application Root set correctly
- [ ] Application URL configured
- [ ] Startup File: index.js
- [ ] Environment variables added (all 9 variables)

**Installation:**
- [ ] Run NPM Install clicked
- [ ] Installation completed (5-15 min wait)
- [ ] No errors shown

**Database:**
- [ ] PostgreSQL database created
- [ ] User created and added
- [ ] All privileges granted
- [ ] Setup script run (via workaround)

**Testing:**
- [ ] App status: Running
- [ ] Website loads in browser
- [ ] Login works
- [ ] Dashboard displays
- [ ] All features accessible

---

## 💡 Important Tips:

### 1. Node_modules Upload (যদি NPM Install না হয়)
যদি cPanel এর "Run NPM Install" button কাজ না করে:
- Local এ `npm install` করুন
- `node_modules` folder ZIP করুন (large হবে ~500MB)
- File Manager দিয়ে upload এবং extract করুন

### 2. Database Setup Alternative
যদি automatic setup না হয়:
- cPanel → phpPgAdmin use করুন
- Manually tables তৈরি করুন
- `fix-permissions.sql` file execute করুন

### 3. Logs Check করা
Error হলে:
- Setup Node.js App → View Logs
- Error messages note করুন
- Google এ search করুন specific error এর জন্য

---

## 🎯 Key Differences (Terminal vs No Terminal):

| Task | With Terminal | Without Terminal |
|------|---------------|------------------|
| Upload files | SCP/SFTP | File Manager (ZIP upload) |
| Install deps | `npm install` | Run NPM Install button |
| Database setup | `node setup-database.js` | Web workaround or phpPgAdmin |
| Check logs | `cat logs/error.log` | cPanel View Logs button |
| Restart app | `npm start` | cPanel Restart button |

---

## ✅ সব কিছু ঠিক থাকলে:

```
✓ Files uploaded successfully
✓ Node.js app created
✓ Dependencies installed (via Run NPM Install button)
✓ Database configured
✓ App running
✓ Website accessible
✓ Login working
✓ All features operational
```

---

## 🎉 Congratulations!

আপনার Social Ads Expert CRM app এখন **terminal ছাড়াই** successfully deployed! 🚀

**Next:** First login এর পর password change করতে ভুলবেন না!
