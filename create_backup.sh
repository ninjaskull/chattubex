#!/bin/bash

# PostgreSQL 16 Backup Creation Script
# Run this script on your server where PostgreSQL 16 is installed

echo "PostgreSQL 16 Database Backup Script"
echo "===================================="

DB_CONNECTION="postgresql://sunil:sunil123@43.204.116.38:5432/sunil"
BACKUP_DIR="./database_backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Creating backup directory: $BACKUP_DIR"

# Test connection first
echo "Testing database connection..."
psql "$DB_CONNECTION" -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
    echo "Please check your database credentials and network connectivity"
    exit 1
fi

# Create different types of backups
echo ""
echo "Creating backups..."

# 1. Complete database dump
echo "1. Creating complete database backup..."
pg_dump "$DB_CONNECTION" > "$BACKUP_DIR/sunil_complete_${DATE}.sql"
echo "✓ Complete backup saved: $BACKUP_DIR/sunil_complete_${DATE}.sql"

# 2. Data-only backup
echo "2. Creating data-only backup..."
pg_dump --data-only "$DB_CONNECTION" > "$BACKUP_DIR/sunil_data_only_${DATE}.sql"
echo "✓ Data-only backup saved: $BACKUP_DIR/sunil_data_only_${DATE}.sql"

# 3. Get table list and create CSV exports
echo "3. Creating CSV exports for each table..."
TABLE_LIST=$(psql "$DB_CONNECTION" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';")

for table in $TABLE_LIST; do
    table=$(echo $table | xargs)  # trim whitespace
    if [ ! -z "$table" ]; then
        echo "   Exporting table: $table"
        psql "$DB_CONNECTION" -c "\copy (SELECT * FROM $table) TO '$BACKUP_DIR/${table}_${DATE}.csv' WITH CSV HEADER"
    fi
done

# 4. Create compressed backup
echo "4. Creating compressed backup..."
pg_dump "$DB_CONNECTION" | gzip > "$BACKUP_DIR/sunil_compressed_${DATE}.sql.gz"
echo "✓ Compressed backup saved: $BACKUP_DIR/sunil_compressed_${DATE}.sql.gz"

echo ""
echo "Backup Summary:"
echo "==============="
ls -lh "$BACKUP_DIR/"

echo ""
echo "All backups created successfully!"
echo "You can now upload any of these files to your Replit project:"
echo "- $BACKUP_DIR/sunil_complete_${DATE}.sql (recommended for full restore)"
echo "- $BACKUP_DIR/sunil_data_only_${DATE}.sql (faster processing)"
echo "- Individual CSV files for specific tables"
echo "- $BACKUP_DIR/sunil_compressed_${DATE}.sql.gz (smaller file size)"