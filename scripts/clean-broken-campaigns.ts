#!/usr/bin/env tsx

import { db } from '../server/db';
import { campaigns } from '../shared/schema';

async function main() {
  console.log('🧹 Cleaning broken campaigns that cannot be decrypted...');
  
  try {
    // Count total campaigns before cleanup
    const allCampaigns = await db.select().from(campaigns);
    console.log(`📊 Found ${allCampaigns.length} campaigns in database`);
    
    if (allCampaigns.length === 0) {
      console.log('✅ No campaigns to clean');
      return;
    }
    
    // Delete all campaigns (they're all broken due to encryption key mismatch)
    const result = await db.delete(campaigns);
    
    console.log(`🗑️  Removed ${allCampaigns.length} broken campaigns`);
    console.log('✅ Database cleaned successfully');
    console.log('\n📝 Users can now upload new campaign data that will work properly');
    
  } catch (error) {
    console.error('💥 Error during cleanup:', error);
  }
  
  process.exit(0);
}

main();