# Social Ads Expert - cPanel Deployment Guide

## Overview
এই guide অনুসরণ করে আপনি Social Ads Expert application টি আপনার cPanel hosting এ deploy করতে পারবেন।

## Prerequisites (প্রয়োজনীয় বিষয়)

1. **cPanel Hosting with Node.js Support**
   - Node.js version 18 বা তার উর্ধে support
   - PostgreSQL database access

2. **Database Requirements**
   - PostgreSQL database (সাধারণত cPanel hosting এ available থাকে)
   - Database credentials (username, password, host, port)

## Step 1: Build & Package (বিল্ড এবং প্যাকেজিং)

```bash
# Build the application
npm run build

# Create deployment package
node scripts/package-cpanel.js
```

এটি `cpanel-deploy` folder তৈরি করবে যেখানে সব deployment files থাকবে।

## Step 2: Upload to cPanel (cPanel এ আপলোড)

1. `cpanel-deploy` folder এর সব contents একটি ZIP file এ compress করুন
2. cPanel File Manager দিয়ে আপনার hosting account এ login করুন
3. আপনার Node.js app directory তে ZIP file আপলোড করুন
4. ZIP file extract করুন

## Step 3: Configure Node.js App (Node.js App কনফিগার)

1. cPanel এ "Setup Node.js App" খুঁজুন এবং click করুন
2. "CREATE APPLICATION" বাটনে click করুন
3. নিম্নলিখিত configuration set করুন:

   - **Node.js Version**: 18 বা তার উর্ধে
   - **Application Mode**: Production
   - **Application Root**: আপনার app directory এর path
   - **Application URL**: আপনার domain বা subdomain
   - **Startup File**: index.js

4. "CREATE" বাটনে click করুন

## Step 4: Install Dependencies (Dependencies Install)

1. Node.js app settings page এ যান
2. "Run NPM Install" বাটনে click করুন
3. Installation complete হওয়ার জন্য অপেক্ষা করুন

## Step 5: Environment Variables (এনভাইরনমেন্ট ভেরিয়েবল)

Node.js app settings এ নিম্নলিখিত environment variables add করুন:

### Required Variables (প্রয়োজনীয়)
- `DATABASE_URL`: আপনার PostgreSQL connection string
- `PGUSER`: Database username
- `PGPASSWORD`: Database password
- `PGDATABASE`: Database name
- `PGHOST`: Database host
- `PGPORT`: Database port (সাধারণত 5432)
- `SESSION_SECRET`: একটি random secret key (min 32 characters)
- `NODE_ENV`: production
- `PORT`: 5000 (বা আপনার assigned port)

### Example Values:
```
DATABASE_URL=postgresql://myuser:mypass@localhost:5432/social_ads_db
PGUSER=myuser
PGPASSWORD=mypass
PGDATABASE=social_ads_db
PGHOST=localhost
PGPORT=5432
SESSION_SECRET=your-very-secure-random-32-character-secret-key
NODE_ENV=production
PORT=5000
```

## Step 6: Database Setup (ডাটাবেস সেটাপ)

1. cPanel এ PostgreSQL database তৈরি করুন
2. Database user তৈরি করুন এবং permissions দিন
3. Connection details environment variables এ set করুন
4. Application start হলে automatically tables তৈরি হবে

## Step 7: Start Application (অ্যাপ্লিকেশন চালু)

1. Node.js app settings এ "START" বাটনে click করুন
2. Status "Running" দেখাবে
3. আপনার domain/subdomain এ visit করুন

## File Structure (ফাইল কাঠামো)

```
cpanel-deploy/
├── index.js              # Main server file
├── package.json          # Production dependencies
├── public/               # React frontend
│   ├── index.html
│   ├── .htaccess         # React routing support
│   └── assets/           # CSS, JS files
├── .env.example          # Environment template
└── README.md            # Deployment instructions
```

## Troubleshooting (সমস্যা সমাধান)

### Common Issues:

1. **Application Won't Start**
   - Check Node.js version (must be 18+)
   - Verify all environment variables are set
   - Check application logs in cPanel

2. **Database Connection Error**
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure PostgreSQL service is running

3. **React Routes Not Working**
   - Ensure .htaccess file is in public folder
   - Check if mod_rewrite is enabled

4. **Static Files Not Loading**
   - Check file permissions
   - Verify public folder structure

### Checking Logs:
1. Go to Node.js app settings in cPanel
2. Click "Show Logs" বা "Error Logs"
3. Look for error messages

### Testing Database Connection:
আপনি Node.js app terminal access পেলে:
```bash
node -e "console.log(process.env.DATABASE_URL)"
```

## Production Optimization (প্রোডাকশন অপটিমাইজেশন)

1. **Enable HTTPS**
   - cPanel SSL/TLS settings এ SSL certificate enable করুন

2. **Domain Configuration**
   - Proper domain/subdomain setup করুন
   - DNS records verify করুন

3. **Performance**
   - Static file caching enable করুন
   - gzip compression enable করুন (যদি available থাকে)

## Support

যদি কোন সমস্যা হয়:

1. **Application Logs**: cPanel Node.js app logs check করুন
2. **Database**: Connection settings verify করুন  
3. **Environment Variables**: সব required variables set আছে কিনা check করুন
4. **Hosting Provider**: Node.js support সম্পর্কে আপনার hosting provider এর সাথে contact করুন

## Security Notes (নিরাপত্তা)

1. **SESSION_SECRET**: Must be at least 32 characters random string
2. **Database**: Use strong passwords
3. **Environment Variables**: Never commit actual values to code repository
4. **HTTPS**: Always use SSL certificate in production

---

**তথ্য**: এই application টি Bengali language support সহ তৈরি। সব features Bengali interface এ available।