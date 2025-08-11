#!/usr/bin/env node

// Simple migration runner
import { spawn } from 'child_process';

console.log('🚀 Starting database migration from old to new database...\n');

const migration = spawn('tsx', ['scripts/database-migration.ts'], {
  stdio: 'inherit',
  env: { ...process.env }
});

migration.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log('\n❌ Migration failed with exit code:', code);
  }
  process.exit(code);
});

migration.on('error', (error) => {
  console.error('Migration process error:', error);
  process.exit(1);
});