# Social Ads Expert - cPanel Deployment Instructions

## Prerequisites
- cPanel hosting with Node.js support (version 18+)
- PostgreSQL database access

## Deployment Steps

1. **Upload Files**
   - Create a ZIP file of all contents in this folder
   - Upload and extract to your cPanel Node.js app directory

2. **Configure Node.js App in cPanel**
   - Go to "Setup Node.js App" in cPanel
   - Create new application:
     - Node.js version: 18+ 
     - Application mode: Production
     - Application root: /path/to/your/app
     - Application URL: your domain or subdomain
     - Startup file: index.js

3. **Install Dependencies**
   - In Node.js app settings, click "Run NPM Install"
   - Wait for installation to complete

4. **Set Environment Variables**
   - In Node.js app settings, add these environment variables:
     - DATABASE_URL: Your PostgreSQL connection string
     - PGUSER: Database username
     - PGPASSWORD: Database password  
     - PGDATABASE: Database name
     - PGHOST: Database host
     - PGPORT: Database port (usually 5432)
     - SESSION_SECRET: Random secret key
     - NODE_ENV: production
     - PORT: 5000 (or your assigned port)

5. **Database Setup**
   - Make sure your PostgreSQL database is created
   - The app will automatically create tables on first run

6. **Start Application**
   - Click "Start" button in Node.js app settings
   - Your app should now be running!

## File Structure
- index.js: Main server file
- public/: React frontend files
- public/.htaccess: React routing configuration

## Troubleshooting
- Check Node.js app logs in cPanel for errors
- Ensure all environment variables are set correctly
- Verify database connection details
- Make sure Node.js version is 18 or higher

## Support
If you encounter issues, check:
1. Node.js app logs in cPanel
2. Database connection settings
3. Environment variables configuration
