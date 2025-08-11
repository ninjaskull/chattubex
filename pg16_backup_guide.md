# PostgreSQL 16 Database Backup Guide

## Method 1: Complete Database Dump (Recommended)

### From your server where PostgreSQL 16 is installed:

```bash
# Create complete backup
pg_dump postgresql://sunil:sunil123@43.204.116.38:5432/sunil > sunil_complete_backup.sql

# Or with compression
pg_dump postgresql://sunil:sunil123@43.204.116.38:5432/sunil | gzip > sunil_backup.sql.gz

# Or data-only backup (no schema)
pg_dump --data-only postgresql://sunil:sunil123@43.204.116.38:5432/sunil > sunil_data_only.sql
```

## Method 2: Individual Table Exports

### Connect and export specific tables:

```bash
# Connect to database
psql postgresql://sunil:sunil123@43.204.116.38:5432/sunil

# List all tables
\dt

# Export each table as CSV
\copy (SELECT * FROM campaigns) TO '/path/campaigns.csv' WITH CSV HEADER
\copy (SELECT * FROM contacts) TO '/path/contacts.csv' WITH CSV HEADER
\copy (SELECT * FROM users) TO '/path/users.csv' WITH CSV HEADER
\copy (SELECT * FROM notes) TO '/path/notes.csv' WITH CSV HEADER
```

## Method 3: Schema + Data Separate

```bash
# Export schema only
pg_dump --schema-only postgresql://sunil:sunil123@43.204.116.38:5432/sunil > schema.sql

# Export data only
pg_dump --data-only postgresql://sunil:sunil123@43.204.116.38:5432/sunil > data.sql
```

## After Creating Backup Files

Upload any of these files to this Replit project and I'll process them:

- `sunil_complete_backup.sql` - Full database backup
- `sunil_data_only.sql` - Data only backup  
- Individual CSV files - Per table exports
- `sunil_backup.sql.gz` - Compressed backup

## Processing Commands (once uploaded)

```bash
# For SQL dumps
node sql_dump_processor.js sql backup_file.sql "Sunil DB Backup"

# For CSV files  
node database_backup_tool.js csv table_name.csv "Table Name"
```