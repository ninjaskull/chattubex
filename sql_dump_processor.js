import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const currentPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

function encrypt(text) {
  if (!text) return '';
  return Buffer.from(text).toString('base64');
}

async function processSQLDump(sqlFilePath, backupName) {
  console.log(`Processing SQL dump: ${sqlFilePath}`);
  
  try {
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Extract INSERT statements and convert to CSV-like campaigns
    const insertMatches = sqlContent.match(/INSERT INTO\s+(\w+)\s+\([^)]+\)\s+VALUES\s*(.+?);/gis);
    
    if (!insertMatches) {
      console.log('No INSERT statements found in SQL dump');
      return;
    }
    
    console.log(`Found ${insertMatches.length} INSERT statements`);
    
    const tableData = {};
    
    // Parse INSERT statements
    insertMatches.forEach(match => {
      try {
        const tableMatch = match.match(/INSERT INTO\s+(\w+)/i);
        const tableName = tableMatch[1];
        
        const valuesMatch = match.match(/VALUES\s*(.+)/is);
        if (valuesMatch) {
          if (!tableData[tableName]) {
            tableData[tableName] = [];
          }
          
          // Extract values (this is a simplified parser)
          const valuesString = valuesMatch[1].replace(/;$/, '');
          const valueRows = valuesString.split(/\),\s*\(/);
          
          valueRows.forEach(row => {
            const cleanRow = row.replace(/^\(|\)$/g, '');
            tableData[tableName].push(cleanRow);
          });
        }
      } catch (error) {
        console.log(`Skipped malformed INSERT: ${error.message}`);
      }
    });
    
    // Convert to campaigns
    let totalRecords = 0;
    for (const [tableName, rows] of Object.entries(tableData)) {
      if (rows.length > 0) {
        // Create a simple CSV format
        const csvContent = rows.join('\n');
        const encryptedData = encrypt(csvContent);
        
        const campaignName = `${backupName} - ${tableName}`;
        
        await currentPool.query(`
          INSERT INTO campaigns (name, encrypted_data, field_mappings, record_count, created_at, updated_at)
          VALUES ($1, $2, $3, $4, NOW(), NOW())
        `, [campaignName, encryptedData, '{}', rows.length]);
        
        console.log(`✓ Backed up ${rows.length} records from ${tableName}`);
        totalRecords += rows.length;
      }
    }
    
    console.log(`\n✓ SQL dump processed! Total records: ${totalRecords}`);
    
  } catch (error) {
    console.error('SQL dump processing failed:', error);
  }
}

// CLI usage
if (process.argv[2] === 'sql' && process.argv[3] && process.argv[4]) {
  const sqlPath = process.argv[3];
  const backupName = process.argv[4];
  processSQLDump(sqlPath, backupName)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} else {
  console.log('Usage: node sql_dump_processor.js sql /path/to/backup.sql "Backup Name"');
}