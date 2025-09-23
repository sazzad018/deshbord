# Social Ads Expert - cPanel Deployment Instructions

## ✅ Fixed Issues
- ✅ Replaced Neon driver with cPanel-compatible PostgreSQL driver
- ✅ Fixed database host (jupiter.hostseba.com instead of localhost)
- ✅ Removed development dependencies from production bundle

## 📋 Deployment Steps

### 1. Environment Variables
Set these in cPanel Node.js App settings:

```
DATABASE_URL=postgresql://beautyzo_ads:your_password@jupiter.hostseba.com:5432/beautyzo_desh
PGUSER=beautyzo_ads
PGPASSWORD=your_actual_password
PGDATABASE=beautyzo_desh
PGHOST=jupiter.hostseba.com
PGPORT=5432
SESSION_SECRET=your-secure-32-character-random-string
NODE_ENV=production
PORT=5000
```

### 2. Upload Files
- ZIP all contents of this folder
- Upload to your cPanel Node.js app directory
- Extract files

### 3. Install Dependencies
- In Node.js app settings, click "Run NPM Install"
- Wait for installation to complete

### 4. Start Application
- Click "Start" button
- Check logs for any errors
- Your app should now work without 503 errors!

## 🔧 Key Changes Made
1. **Database Driver**: Changed from @neondatabase/serverless to postgres
2. **Connection**: Updated to use jupiter.hostseba.com host
3. **SSL**: Configured for cPanel SSL requirements
4. **Dependencies**: Removed all development dependencies

## 📞 Support
If you still get errors, check:
1. Database credentials are correct
2. Database "beautyzo_desh" exists in cPanel
3. User "beautyzo_ads" has access to the database
4. All environment variables are set properly
