# Database Migration Guide

Your old database `postgresql://sunil:sunil123@localhost:5432/campaign_db` needs to be migrated to the new Replit database. Since direct connection from Replit to your localhost isn't possible, here are several migration options:

## Option 1: Manual pg_dump/pg_restore (Recommended)

### Step 1: Create backup from your local machine
```bash
# On your local machine where the old database is running
pg_dump -h localhost -U sunil -d campaign_db -f campaign_backup.sql

# Or create a compressed backup
pg_dump -h localhost -U sunil -d campaign_db -Fc -f campaign_backup.dump
```

### Step 2: Upload backup to Replit
1. Upload the `campaign_backup.sql` or `campaign_backup.dump` file to this Replit
2. Place it in the `backups/` folder

### Step 3: Restore to new database
```bash
# For SQL format
psql "${DATABASE_URL}" -f backups/campaign_backup.sql

# For dump format  
pg_restore -d "${DATABASE_URL}" backups/campaign_backup.dump
```

## Option 2: Use the Automated Backup Tool

### Step 1: Run backup from your local machine
If your old database is accessible from your local machine, run:
```bash
# Create JSON backup (easier to inspect/modify)
tsx scripts/backup-options.ts backup "postgresql://sunil:sunil123@localhost:5432/campaign_db" json

# Or create SQL backup
tsx scripts/backup-options.ts backup "postgresql://sunil:sunil123@localhost:5432/campaign_db" sql
```

### Step 2: Transfer backup files to Replit
Upload the generated backup files from the `backups/` folder to this Replit

### Step 3: Restore in Replit
```bash
# For JSON backups
tsx scripts/backup-options.ts restore backups/tablename_timestamp.json json

# For SQL backups  
tsx scripts/backup-options.ts restore backups/tablename_timestamp.sql sql
```

## Option 3: CSV Export/Import

### Step 1: Export data as CSV from old database
```sql
-- Export each table to CSV
COPY (SELECT * FROM campaigns) TO '/path/to/campaigns.csv' CSV HEADER;
COPY (SELECT * FROM contacts) TO '/path/to/contacts.csv' CSV HEADER;
COPY (SELECT * FROM users) TO '/path/to/users.csv' CSV HEADER;
-- Repeat for all tables
```

### Step 2: Use the built-in CSV import feature
1. Upload CSV files to Replit
2. Use the application's CSV import functionality through the UI
3. Or use the API endpoint: `POST /api/import/csv`

## Option 4: Manual SQL Export

### Create manual SQL export from your old database:

```sql
-- Get table structures
SELECT 
  'CREATE TABLE ' || table_name || ' (' ||
  array_to_string(
    array_agg(
      column_name || ' ' || data_type ||
      CASE 
        WHEN character_maximum_length IS NOT NULL 
        THEN '(' || character_maximum_length || ')'
        ELSE ''
      END ||
      CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
    ), ', '
  ) || ');'
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY table_name;

-- Get data as INSERT statements
-- Run for each table individually
SELECT 'INSERT INTO your_table VALUES (' ||
       array_to_string(
         array_agg(
           CASE 
             WHEN column_value IS NULL THEN 'NULL'
             ELSE quote_literal(column_value::text)
           END
         ), ', '
       ) || ');'
FROM your_table;
```

## Current Database Schema

Your new database already has these tables ready:
- `users` - User accounts and authentication
- `campaigns` - Campaign management with encrypted data
- `contacts` - Contact information for campaigns  
- `documents` - File upload management
- `notes` - Encrypted note storage
- `chat_sessions` - AI chat session tracking
- `chat_messages` - Chat message history

## Quick Commands Available

After uploading backup files, you can use:

```bash
# List available backups
tsx scripts/backup-options.ts list

# Restore a specific backup
tsx scripts/backup-options.ts restore backups/your-backup-file.json json

# Test current database connection
tsx scripts/database-migration.ts
```

## Troubleshooting

### Connection Issues
- Ensure your old database is running on port 5432
- Check firewall settings allow connections
- Verify username/password are correct
- Try connecting with psql first: `psql "postgresql://sunil:sunil123@localhost:5432/campaign_db"`

### Data Issues
- Check for foreign key constraints
- Verify data types match between old and new schema
- Handle any encryption/decryption needs for sensitive data

### Large Data Sets
- For large databases, consider splitting exports by table
- Use compressed formats (.dump) for faster transfer
- Consider pagination for very large tables

## Next Steps

1. Choose the migration method that works best for your situation
2. Create backup from your old database
3. Upload backup files to this Replit
4. Run restore commands
5. Verify data integrity after migration

The application is ready to receive your migrated data and all systems are operational!