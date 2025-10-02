# 🚀 cPanel এ Deploy করার জন্য Ready!

## ✅ সব কিছু তৈরি হয়ে গেছে!

এই `cpanel-deploy` folder এ সব files আছে যা আপনার cPanel এ upload করতে হবে।

---

## 📦 Step 1: Files Download করুন

### Option A: ZIP File তৈরি করুন (Recommended)
আপনার local computer এ:
```bash
# cpanel-deploy folder টা ZIP করুন
# Windows: Right click → Send to → Compressed folder
# Mac/Linux: Right click → Compress
```

### Option B: Direct Download from Replit
1. Replit Files panel এ যান
2. `cpanel-deploy` folder এ right click করুন
3. "Download as zip" select করুন

---

## 🌐 Step 2: cPanel এ Upload করুন

### 2.1 File Manager Open করুন
1. cPanel login করুন
2. **File Manager** open করুন
3. আপনার app directory তে যান (যেমন: `~/public_html/app` বা `~/nodejs/app`)

### 2.2 Files Upload করুন
1. **Upload** button এ click করুন
2. ZIP file select করুন অথবা সব files drag & drop করুন
3. ZIP হলে extract করুন

---

## ⚙️ Step 3: Node.js App Configure করুন

### 3.1 Setup Node.js Application
cPanel → **Setup Node.js App** → **Create Application**

**Configuration:**
```
Node.js Version: 18.x বা তার উপরে
Application Mode: Production
Application Root: আপনার app directory path
Application URL: আপনার domain
Application Startup File: index.js
```

### 3.2 Environment Variables Set করুন
**Edit করুন এবং নিচের variables add করুন:**

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
PGUSER=your_database_username
PGPASSWORD=your_database_password
PGDATABASE=your_database_name
PGHOST=localhost
PGPORT=5432
NODE_ENV=production
PORT=5000
SESSION_SECRET=generate-a-random-32-character-string
```

**SESSION_SECRET Generate করার জন্য:**
Terminal এ run করুন:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 NPM Install করুন
"Run NPM Install" button এ click করুন অথবা terminal এ:
```bash
npm install --production
```

---

## 🗄️ Step 4: Database Setup করুন

### 4.1 PostgreSQL Database তৈরি করুন
cPanel → **PostgreSQL Databases** → **Create Database**

### 4.2 Database User তৈরি করুন
1. User তৈরি করুন
2. User কে database এ add করুন
3. **All Privileges** দিন

### 4.3 Database Tables তৈরি করুন
Terminal এ যান এবং run করুন:
```bash
cd ~/your-app-directory
node setup-database.js
```

**Expected Output:**
```
✅ Database setup completed successfully!
```

---

## 🎯 Step 5: Application Start করুন

### cPanel Node.js App Manager থেকে:
1. আপনার application select করুন
2. **Start App** বা **Restart App** button এ click করুন
3. Status **Running** হওয়া পর্যন্ত অপেক্ষা করুন

---

## ✅ Step 6: Verify করুন

### Browser এ Test করুন:
```
https://yourdomain.com
```

### Check করুন:
- [x] Login page দেখাচ্ছে
- [x] Login করতে পারছেন
- [x] Dashboard load হচ্ছে
- [x] Project Management → সম্পূর্ণ ওয়েবসাইট তালিকা section দেখা যাচ্ছে
- [x] Website add করতে পারছেন
- [x] PDF download করতে পারছেন

---

## 🆕 নতুন Features Test করুন

### Completed Websites Management:
1. **Project Management** page এ যান
2. নিচে scroll করে **"সম্পূর্ণ ওয়েবসাইট তালিকা"** section খুঁজুন
3. **"নতুন ওয়েবসাইট যোগ করুন"** button এ click করুন
4. সব field fill up করুন:
   - Client select করুন
   - Project name দিন
   - Website URL দিন
   - Website login credentials দিন
   - cPanel credentials দিন
   - Nameserver info দিন
   - Service provider দিন
5. **Save** করুন

### PDF Download Test:
1. যেকোনো completed website এ **Green download icon** এ click করুন
2. "PDF তৈরি হচ্ছে..." message দেখবেন
3. কিছুক্ষণ পরে PDF automatic download হবে
4. PDF open করে verify করুন সব info আছে কিনা

---

## 🔧 Troubleshooting

### Application Start না হলে:
```bash
# Terminal এ error logs দেখুন:
cd ~/your-app-directory
npm start

# অথবা cPanel error logs check করুন
```

### Database Connection Error:
1. Environment variables check করুন
2. Database credentials verify করুন
3. `setup-database.js` আবার run করুন

### PDF Download না হলে:
1. Browser cache clear করুন
2. অন্য browser এ try করুন
3. Browser console (F12) এ error check করুন

### Port Already in Use:
```bash
# PORT environment variable change করুন
# অথবা existing process kill করুন
```

---

## 📁 Folder Structure (cPanel এ):

```
your-app-directory/
├── index.js                    # Main server file
├── public/                     # Frontend files
│   ├── index.html
│   └── assets/
│       ├── index-xxx.js       # JavaScript bundle
│       ├── index-xxx.css      # Styles
│       └── ...
├── package.json               # Dependencies
├── setup-database.js          # Database setup script
├── database-schema.sql        # SQL schema (reference)
└── node_modules/             # (created by npm install)
```

---

## 🎉 সব শেষ!

আপনার Social Ads Expert CRM application এখন live! 🚀

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**⚠️ Security:** First login এর পর অবশ্যই password change করুন!

---

## 📞 যদি সমস্যা হয়:

1. **Error Logs:** cPanel → Node.js App → View Logs
2. **Database Logs:** cPanel → PostgreSQL → Check permissions
3. **Browser Console:** F12 press করে Console tab দেখুন

---

## ✨ নতুন Features:
✅ Complete Website Management
✅ Credentials Storage (Website + cPanel)
✅ Nameserver Configuration
✅ Professional PDF Download
✅ Search & Filter
✅ Responsive Design

**সব features working করছে এবং production ready!** 🎊
