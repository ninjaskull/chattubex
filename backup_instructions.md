# Step-by-Step Backup Instructions

## Method 1: Using the Automated Script (Easiest)

1. **Download the script** `create_backup.sh` from this project
2. **Copy it to your PostgreSQL server** 
3. **Run the script**:
   ```bash
   chmod +x create_backup.sh
   ./create_backup.sh
   ```
4. **Upload any generated backup file** to this Replit project

## Method 2: Manual Commands

### Step 1: Test Your Database Connection
```bash
psql postgresql://sunil:sunil123@43.204.116.38:5432/sunil -c "SELECT version();"
```

### Step 2: Create Backup (Choose One)

**Option A: Complete Database Backup**
```bash
pg_dump postgresql://sunil:sunil123@43.204.116.38:5432/sunil > sunil_backup.sql
```

**Option B: Data-Only Backup** 
```bash
pg_dump --data-only postgresql://sunil:sunil123@43.204.116.38:5432/sunil > sunil_data.sql
```

**Option C: Individual Table CSV**
```bash
# Connect to database
psql postgresql://sunil:sunil123@43.204.116.38:5432/sunil

# List tables
\dt

# Export specific tables
\copy (SELECT * FROM campaigns) TO 'campaigns.csv' WITH CSV HEADER
\copy (SELECT * FROM contacts) TO 'contacts.csv' WITH CSV HEADER
\copy (SELECT * FROM users) TO 'users.csv' WITH CSV HEADER
```

## Method 3: Using pgAdmin or Database Tools

1. **Open pgAdmin** or your database management tool
2. **Connect to**: `43.204.116.38:5432`
3. **Database**: `sunil`
4. **Username**: `sunil` 
5. **Password**: `sunil123`
6. **Right-click database** → **Backup**
7. **Choose format**: Plain or Custom
8. **Save backup file**

## After Creating Backup

1. **Upload the backup file** to this Replit project
2. **I'll process it immediately** using the migration tools

## Troubleshooting

**If you get "command not found" errors:**
- Install PostgreSQL client tools: `sudo apt install postgresql-client-16`
- Or use Docker: `docker run --rm postgres:16 pg_dump ...`

**If connection fails:**
- Check if PostgreSQL service is running
- Verify firewall allows connections on port 5432
- Confirm database credentials are correct