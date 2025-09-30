# Social Ads Expert - cPanel Deployment Instructions

## 📋 Overview
Social Ads Expert একটি CRM application যা Bengali language support সহ তৈরি করা হয়েছে। এতে admin authentication, client management, financial tracking, এবং project management features রয়েছে।

## ✅ Prerequisites (প্রয়োজনীয়)
- cPanel hosting with Node.js support (version 18 or higher)
- PostgreSQL database access
- SSL certificate (recommended for production)

## 🚀 Deployment Steps

### Step 1: Upload Files
1. এই folder এর সব contents একটি ZIP file এ compress করুন
2. cPanel File Manager দিয়ে login করুন
3. আপনার Node.js app directory তে ZIP file upload করুন
4. ZIP file extract করুন

### Step 2: Configure Node.js App in cPanel
1. cPanel এ "Setup Node.js App" অপশনে যান
2. "CREATE APPLICATION" button click করুন
3. নিম্নলিখিত configuration set করুন:
   - **Node.js version**: 18.x বা higher
   - **Application mode**: Production
   - **Application root**: /home/yourusername/your-app-folder
   - **Application URL**: Your domain বা subdomain
   - **Startup file**: index.js
4. "CREATE" button click করুন

### Step 3: Install Dependencies
1. Node.js app settings page এ যান
2. "Run NPM Install" button click করুন
3. Installation complete হওয়ার জন্য অপেক্ষা করুন (2-5 minutes)

### Step 4: Set Environment Variables
Node.js app settings এ নিম্নলিখিত environment variables add করুন:

#### Database Configuration:
```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
PGUSER=your_database_username
PGPASSWORD=your_database_password
PGDATABASE=your_database_name
PGHOST=your_database_host
PGPORT=5432
```

#### Application Configuration:
```
NODE_ENV=production
PORT=5000
```

#### Session Secret (32+ characters required):
```
SESSION_SECRET=generate-a-secure-random-32-character-key
```

💡 **Tip**: Generate secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Database Setup
1. cPanel এ PostgreSQL database তৈরি করুন
2. Database user তৈরি করুন এবং full permissions দিন
3. Database credentials environment variables এ set করুন

### Step 6: Create Database Tables (IMPORTANT!)
⚠️ **এই step টি অত্যন্ত গুরুত্বপূর্ণ - Application start করার আগে করতে হবে!**

cPanel Terminal বা SSH access থেকে:
```bash
node setup-database.js
```

এটি automatically সব database tables তৈরি করবে। আপনি দেখবেন:
- ✅ Created table: admin_users
- ✅ Created table: clients
- ✅ Created table: spend_logs
- (এবং আরো...)

যদি error আসে, নিশ্চিত করুন যে:
- সব environment variables সঠিকভাবে set করা আছে
- Database connection working
- Database user এর CREATE TABLE permission আছে

### Step 7: Start Application
1. Node.js app settings এ "START" button click করুন
2. Status "Running" দেখাবে
3. আপনার domain/subdomain visit করুন

## 🔐 Default Admin Login

Application deploy এর পর, নিম্নলিখিত credentials দিয়ে admin login করতে পারবেন:

```
Username: admin
Password: admin123
```

### ⚠️ IMPORTANT Security Steps:
1. **First login এর পরে অবশ্যই password change করুন**
2. Strong password ব্যবহার করুন (minimum 8 characters, mix of letters, numbers, symbols)
3. Admin credentials কাউকে share করবেন না
4. Production এ HTTPS/SSL certificate enable করুন

## 📁 File Structure
```
cpanel-deploy/
├── index.js              # Main server file (bundled)
├── package.json          # Production dependencies
├── .env.example          # Environment variables template
├── README.md            # This file
└── public/              # React frontend (built)
    ├── index.html
    ├── .htaccess        # React routing support
    └── assets/          # Compiled CSS, JS files
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. Application Won't Start
- ✓ Check Node.js version (must be 18 or higher)
- ✓ Verify all environment variables are set correctly
- ✓ Check application logs in cPanel
- ✓ Ensure npm install completed successfully

#### 2. Database Connection Error
- ✓ Verify DATABASE_URL format is correct
- ✓ Check database credentials
- ✓ Ensure PostgreSQL service is running
- ✓ Test database connection from cPanel

#### 3. Login Page Not Working
- ✓ Wait 2-3 minutes after first start for database initialization
- ✓ Check browser console for errors
- ✓ Verify SESSION_SECRET is set (32+ characters)
- ✓ Clear browser cache and try again

#### 4. React Routes Not Working (404 errors)
- ✓ Ensure .htaccess file exists in public/ folder
- ✓ Check if mod_rewrite is enabled in Apache
- ✓ Verify Application URL is set correctly

#### 5. Static Files Not Loading
- ✓ Check file permissions (755 for folders, 644 for files)
- ✓ Verify public/ folder structure is intact
- ✓ Check Apache error logs

### Checking Logs:
1. cPanel → Node.js App Settings → "Show Logs" / "Error Logs"
2. Look for error messages and stack traces
3. Common errors will show database connection issues or missing environment variables

### Testing Database Connection:
If you have terminal access:
```bash
node -e "console.log(process.env.DATABASE_URL)"
```

## 🎨 Application Features

### Admin Panel:
- ✅ Bengali language interface
- ✅ Client management with Rich Clients categorization
- ✅ Financial tracking (deposits, spending, wallet)
- ✅ Project management with employee assignments
- ✅ Meeting scheduling with reminders
- ✅ AI-powered query system
- ✅ Export to PDF/Excel
- ✅ Dual currency support (USD/BDT)

### Public Portals:
- ✅ Client Portal (accessible via unique portal key)
- ✅ Employee Portal (for project tracking)

## 🔒 Security Notes

1. **SESSION_SECRET**: Must be at least 32 characters random string
2. **Database Passwords**: Use strong, unique passwords
3. **Admin Password**: Change default password immediately
4. **HTTPS**: Enable SSL certificate in production
5. **Environment Variables**: Never commit actual values to code repository
6. **Regular Backups**: Set up automated database backups

## 📊 Production Optimization

1. **Enable HTTPS**
   - Install SSL certificate in cPanel
   - Force HTTPS redirects

2. **Database Optimization**
   - Regular database backups
   - Monitor database size
   - Index optimization if needed

3. **Performance**
   - Enable gzip compression
   - Use CDN for static assets (optional)
   - Monitor memory usage

4. **Monitoring**
   - Set up application monitoring
   - Check logs regularly
   - Monitor disk space

## 💼 Support & Maintenance

### Regular Maintenance:
- Check application logs weekly
- Update dependencies monthly (with testing)
- Regular database backups
- Monitor server resources

### If You Encounter Issues:
1. Check Node.js app logs in cPanel
2. Verify database connection
3. Confirm all environment variables are set
4. Contact your hosting provider for server-specific issues

---

## 📝 Quick Start Checklist

- [ ] Upload and extract files to cPanel
- [ ] Create Node.js app with correct configuration
- [ ] Create PostgreSQL database
- [ ] Set all environment variables
- [ ] Run NPM install
- [ ] Start the application
- [ ] Test admin login (admin/admin123)
- [ ] **Change admin password immediately**
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups

---

**Version**: 1.0.0  
**Language**: Bengali (বাংলা) + English  
**Framework**: React + Node.js + Express + PostgreSQL  
**License**: Proprietary
