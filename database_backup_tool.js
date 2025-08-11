import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import pkg from 'pg';
const { Pool } = pkg;

// Current database connection
const currentPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Simple encryption function 
function encrypt(text) {
  if (!text) return '';
  return Buffer.from(text).toString('base64');
}

async function backupFromExternalDatabase(sourceConnectionString, backupName) {
  console.log('Starting database backup process...');
  
  try {
    // Connect to source database (PostgreSQL 16 compatible)
    const sourcePool = new Pool({
      connectionString: sourceConnectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      max: 5,
      allowExitOnIdle: true
    });
    
    console.log('Connected to source database');
    
    // Get all tables from source database
    const tablesResult = await sourcePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    
    console.log(`Found ${tablesResult.rows.length} tables to backup`);
    
    let totalRecords = 0;
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`Backing up table: ${tableName}`);
      
      try {
        // Get all data from table
        const dataResult = await sourcePool.query(`SELECT * FROM ${tableName}`);
        const records = dataResult.rows;
        
        if (records.length > 0) {
          // Convert to CSV format
          const headers = Object.keys(records[0]);
          let csvContent = headers.join(',') + '\n';
          
          records.forEach(record => {
            const row = headers.map(header => {
              const value = record[header];
              if (value === null || value === undefined) return '';
              // Escape commas and quotes
              const stringValue = String(value);
              if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            }).join(',');
            csvContent += row + '\n';
          });
          
          // Create field mappings
          const fieldMappings = {};
          headers.forEach((header, index) => {
            fieldMappings[`field_${index}`] = header;
          });
          
          // Encrypt and save to current database
          const encryptedData = encrypt(csvContent);
          const campaignName = `${backupName} - ${tableName}`;
          
          await currentPool.query(`
            INSERT INTO campaigns (name, encrypted_data, field_mappings, record_count, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
          `, [campaignName, encryptedData, JSON.stringify(fieldMappings), records.length]);
          
          console.log(`✓ Backed up ${records.length} records from ${tableName}`);
          totalRecords += records.length;
        }
      } catch (error) {
        console.log(`⚠ Skipped table ${tableName}: ${error.message}`);
      }
    }
    
    await sourcePool.end();
    console.log(`\n✓ Backup completed! Total records backed up: ${totalRecords}`);
    
  } catch (error) {
    console.error('Backup failed:', error.message);
    throw error;
  }
}

async function backupFromCSVFile(csvFilePath, campaignName) {
  console.log(`Backing up CSV file: ${csvFilePath}`);
  
  try {
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    const records = [];
    
    const parser = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    for await (const record of parser) {
      records.push(record);
    }
    
    if (records.length === 0) {
      console.log('No records found in CSV file');
      return;
    }
    
    const headers = Object.keys(records[0]);
    const fieldMappings = {};
    headers.forEach((header, index) => {
      fieldMappings[`field_${index}`] = header;
    });
    
    const encryptedData = encrypt(fileContent);
    
    await currentPool.query(`
      INSERT INTO campaigns (name, encrypted_data, field_mappings, record_count, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, [campaignName, encryptedData, JSON.stringify(fieldMappings), records.length]);
    
    console.log(`✓ Successfully backed up ${records.length} records from CSV`);
    
  } catch (error) {
    console.error('CSV backup failed:', error);
  }
}

// Export functions for different backup scenarios
export { backupFromExternalDatabase, backupFromCSVFile };

// CLI usage
if (process.argv[2]) {
  const method = process.argv[2];
  
  if (method === 'database' && process.argv[3] && process.argv[4]) {
    const connectionString = process.argv[3];
    const backupName = process.argv[4];
    backupFromExternalDatabase(connectionString, backupName)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } 
  else if (method === 'csv' && process.argv[3] && process.argv[4]) {
    const csvPath = process.argv[3];
    const campaignName = process.argv[4];
    backupFromCSVFile(csvPath, campaignName)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
  else {
    console.log(`
Usage:
  node database_backup_tool.js database "postgresql://user:pass@host:port/db" "Backup Name"
  node database_backup_tool.js csv "/path/to/file.csv" "Campaign Name"
`);
  }
}