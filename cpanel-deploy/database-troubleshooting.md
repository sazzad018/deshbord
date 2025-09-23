# Database Connection Troubleshooting for cPanel

## Quick Fix Steps

### Step 1: Try Localhost Connection
Most cPanel hosting requires `localhost` for database connections:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

### Step 2: Check cPanel Database Settings

1. **Login to cPanel**
2. **Go to "Remote MySQL"**
3. **Add Access Host:**
   - Add `localhost` 
   - Add `%` (wildcard for all)
   - Add your domain name

### Step 3: Verify Database Credentials

In cPanel, check:
- **MySQL Databases** → Database name
- **MySQL Users** → Username and password
- **Database User Privileges** → Make sure user has ALL PRIVILEGES

### Step 4: Test Different Connection Strings

Try these in order:

```bash
# Option 1: Localhost with port (most common)
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Option 2: Localhost without port
DATABASE_URL="postgresql://user:pass@localhost/dbname"

# Option 3: Local IP
DATABASE_URL="postgresql://user:pass@127.0.0.1:5432/dbname"

# Option 4: Internal hostname (check cPanel for exact host)
DATABASE_URL="postgresql://user:pass@sql.yourdomain.com:5432/dbname"
```

## Common Issues & Solutions

### Issue 1: "Connection Refused"
**Cause:** Wrong hostname or PostgreSQL not running
**Solution:** Use `localhost` instead of external hostname

### Issue 2: "Authentication Failed"
**Cause:** Wrong username/password
**Solution:** Check cPanel → MySQL Users

### Issue 3: "Database Does Not Exist"
**Cause:** Wrong database name
**Solution:** Check cPanel → MySQL Databases

### Issue 4: "Host Not Allowed"
**Cause:** Remote access not enabled
**Solution:** Add host to Remote MySQL in cPanel

## Testing Your Connection

1. **Edit credentials** in `test-db-connection.js`
2. **Run the test:**
   ```bash
   node test-db-connection.js
   ```
3. **Use the working connection string** in your environment

## Environment Variable Setup

Once you find the working connection string:

1. **Create/update `.env` file:**
   ```bash
   DATABASE_URL="postgresql://working_connection_string"
   SESSION_SECRET="your-secret-key-here"
   ```

2. **Restart your application:**
   ```bash
   npm start
   ```

## Still Having Issues?

Contact your hosting provider and ask for:
1. **Exact database hostname** for internal connections
2. **PostgreSQL port number** (usually 5432)
3. **Whether remote connections** are allowed
4. **Internal network** requirements

## Alternative: Use SQLite for Testing

If PostgreSQL continues to fail, you can temporarily use SQLite:

```bash
# Install SQLite driver
npm install better-sqlite3

# Use SQLite connection
DATABASE_URL="sqlite:./database.db"
```

Note: This is only for testing - PostgreSQL is recommended for production.