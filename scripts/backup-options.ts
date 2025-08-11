import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

interface BackupOptions {
  sourceConnectionString: string;
  outputFormat: 'sql' | 'json' | 'csv';
  outputDir?: string;
}

interface RestoreOptions {
  targetConnectionString: string;
  backupFile: string;
  format: 'sql' | 'json' | 'csv';
}

class DatabaseBackupRestore {
  async createBackup(options: BackupOptions): Promise<string[]> {
    const { sourceConnectionString, outputFormat, outputDir = './backups' } = options;
    
    console.log('🔍 Connecting to source database...');
    const pool = new Pool({ connectionString: sourceConnectionString });
    
    try {
      // Test connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Connected to source database');
      
      // Ensure backup directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      // Get list of tables
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      console.log(`📋 Found tables: ${tables.join(', ')}`);
      
      const backupFiles: string[] = [];
      
      for (const tableName of tables) {
        console.log(`📦 Backing up table: ${tableName}`);
        
        const tableData = await pool.query(`SELECT * FROM "${tableName}"`);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        if (outputFormat === 'json') {
          const fileName = `${tableName}_${timestamp}.json`;
          const filePath = path.join(outputDir, fileName);
          
          const backup = {
            table: tableName,
            timestamp: new Date().toISOString(),
            recordCount: tableData.rows.length,
            data: tableData.rows
          };
          
          await fs.writeFile(filePath, JSON.stringify(backup, null, 2));
          backupFiles.push(filePath);
          console.log(`   ✓ Saved ${tableData.rows.length} records to ${fileName}`);
          
        } else if (outputFormat === 'sql') {
          const fileName = `${tableName}_${timestamp}.sql`;
          const filePath = path.join(outputDir, fileName);
          
          let sqlContent = `-- Backup of table: ${tableName}\n`;
          sqlContent += `-- Created: ${new Date().toISOString()}\n`;
          sqlContent += `-- Records: ${tableData.rows.length}\n\n`;
          
          if (tableData.rows.length > 0) {
            // Get column names
            const columns = tableData.fields.map(field => `"${field.name}"`);
            
            sqlContent += `-- Delete existing data (optional)\n`;
            sqlContent += `-- DELETE FROM "${tableName}";\n\n`;
            
            // Generate INSERT statements
            for (const row of tableData.rows) {
              const values = columns.map(col => {
                const value = row[col.replace(/"/g, '')];
                if (value === null) return 'NULL';
                if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                if (typeof value === 'boolean') return value ? 'true' : 'false';
                if (value instanceof Date) return `'${value.toISOString()}'`;
                return String(value);
              });
              
              sqlContent += `INSERT INTO "${tableName}" (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
            }
          }
          
          await fs.writeFile(filePath, sqlContent);
          backupFiles.push(filePath);
          console.log(`   ✓ Saved ${tableData.rows.length} records to ${fileName}`);
        }
      }
      
      console.log(`\n🎉 Backup completed! Files created:`);
      backupFiles.forEach(file => console.log(`   📄 ${file}`));
      
      return backupFiles;
      
    } finally {
      await pool.end();
    }
  }
  
  async restoreFromBackup(options: RestoreOptions): Promise<void> {
    const { targetConnectionString, backupFile, format } = options;
    
    console.log('🔄 Starting restore process...');
    console.log(`📁 Backup file: ${backupFile}`);
    
    const pool = new Pool({ connectionString: targetConnectionString });
    
    try {
      // Test connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Connected to target database');
      
      if (format === 'json') {
        const backupContent = await fs.readFile(backupFile, 'utf-8');
        const backup = JSON.parse(backupContent);
        
        console.log(`📦 Restoring table: ${backup.table}`);
        console.log(`📊 Records to restore: ${backup.recordCount}`);
        
        if (backup.data && backup.data.length > 0) {
          const sampleRecord = backup.data[0];
          const columns = Object.keys(sampleRecord);
          const columnNames = columns.map(col => `"${col}"`).join(', ');
          const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO "${backup.table}" (${columnNames}) 
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `;
          
          const restoreClient = await pool.connect();
          try {
            await restoreClient.query('BEGIN');
            
            let restored = 0;
            for (const record of backup.data) {
              try {
                const values = columns.map(col => record[col]);
                await restoreClient.query(insertQuery, values);
                restored++;
              } catch (error) {
                console.warn(`⚠️  Failed to restore record:`, error instanceof Error ? error.message : String(error));
              }
            }
            
            await restoreClient.query('COMMIT');
            console.log(`✅ Restored ${restored}/${backup.data.length} records to ${backup.table}`);
            
          } catch (error) {
            await restoreClient.query('ROLLBACK');
            throw error;
          } finally {
            restoreClient.release();
          }
        }
        
      } else if (format === 'sql') {
        const sqlContent = await fs.readFile(backupFile, 'utf-8');
        const statements = sqlContent
          .split('\n')
          .filter(line => line.trim() && !line.trim().startsWith('--'))
          .join('\n')
          .split(';')
          .filter(stmt => stmt.trim());
        
        console.log(`📝 Executing ${statements.length} SQL statements...`);
        
        const restoreClient = await pool.connect();
        try {
          await restoreClient.query('BEGIN');
          
          for (const statement of statements) {
            if (statement.trim()) {
              await restoreClient.query(statement.trim());
            }
          }
          
          await restoreClient.query('COMMIT');
          console.log(`✅ Successfully executed all SQL statements`);
          
        } catch (error) {
          await restoreClient.query('ROLLBACK');
          throw error;
        } finally {
          restoreClient.release();
        }
      }
      
    } finally {
      await pool.end();
    }
  }
  
  async listBackups(backupDir = './backups'): Promise<string[]> {
    try {
      const files = await fs.readdir(backupDir);
      return files.filter(file => file.endsWith('.json') || file.endsWith('.sql'));
    } catch (error) {
      console.log('No backup directory found or empty');
      return [];
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const backupRestore = new DatabaseBackupRestore();
  
  if (command === 'backup') {
    const sourceDb = args[1] || "postgresql://sunil:sunil123@localhost:5432/campaign_db";
    const format = (args[2] as 'sql' | 'json') || 'json';
    
    console.log('🚀 Creating backup...');
    try {
      await backupRestore.createBackup({
        sourceConnectionString: sourceDb,
        outputFormat: format
      });
    } catch (error) {
      console.error('❌ Backup failed:', error instanceof Error ? error.message : String(error));
      console.log('\n💡 Troubleshooting tips:');
      console.log('  1. Ensure your old database is running and accessible');
      console.log('  2. Check the connection string is correct');
      console.log('  3. Verify network connectivity to the database');
      console.log('  4. Consider using pg_dump if direct connection fails');
    }
    
  } else if (command === 'restore') {
    const backupFile = args[1];
    const format = (args[2] as 'sql' | 'json') || 'json';
    
    if (!backupFile) {
      console.error('❌ Please provide backup file path');
      process.exit(1);
    }
    
    console.log('🔄 Restoring from backup...');
    try {
      await backupRestore.restoreFromBackup({
        targetConnectionString: process.env.DATABASE_URL!,
        backupFile,
        format
      });
      console.log('🎉 Restore completed successfully!');
    } catch (error) {
      console.error('❌ Restore failed:', error instanceof Error ? error.message : String(error));
    }
    
  } else if (command === 'list') {
    const backups = await backupRestore.listBackups();
    console.log('📋 Available backups:');
    backups.forEach(backup => console.log(`   📄 ${backup}`));
    
  } else {
    console.log('🔧 Database Backup & Restore Tool');
    console.log('\nUsage:');
    console.log('  tsx scripts/backup-options.ts backup [connection-string] [format]');
    console.log('  tsx scripts/backup-options.ts restore [backup-file] [format]');
    console.log('  tsx scripts/backup-options.ts list');
    console.log('\nExamples:');
    console.log('  tsx scripts/backup-options.ts backup "postgresql://user:pass@host:5432/db" json');
    console.log('  tsx scripts/backup-options.ts restore backups/campaigns_2025-01-11.json json');
    console.log('  tsx scripts/backup-options.ts list');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DatabaseBackupRestore };