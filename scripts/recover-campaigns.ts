#!/usr/bin/env tsx

import { db } from '../server/db';
import { campaigns } from '../shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Multiple possible encryption keys that might have been used
const POSSIBLE_KEYS = [
  'default-key-32-chars-long-here!',
  'fallaowl-business-intelligence',
  'leadiq-pro-encryption-key-here',
  'campaign-management-key-2024',
  process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!'
];

function createKeyVariants(baseKey: string): string[] {
  const variants = [
    baseKey,
    crypto.createHash('sha256').update(baseKey).digest('hex'),
    crypto.createHash('md5').update(baseKey).digest('hex'),
    baseKey.padEnd(32, '0').substring(0, 32),
    crypto.createHash('sha256').update(baseKey).digest().toString('hex').substring(0, 32)
  ];
  return [...new Set(variants)];
}

// Current encryption function
function encrypt(text: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!';
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

async function attemptDataRecovery(encryptedData: string): Promise<string | null> {
  // Try base64 decoding first
  try {
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
    JSON.parse(decoded);
    return decoded;
  } catch (e) {}

  // Try hex decoding
  try {
    const decoded = Buffer.from(encryptedData, 'hex').toString('utf8');
    JSON.parse(decoded);
    return decoded;
  } catch (e) {}

  // Try direct JSON
  try {
    JSON.parse(encryptedData);
    return encryptedData;
  } catch (e) {}

  // Try IV:encrypted format with multiple keys
  if (encryptedData.includes(':')) {
    const parts = encryptedData.split(':');
    if (parts.length === 2) {
      const ivHex = parts[0];
      const encrypted = parts[1];
      
      for (const baseKey of POSSIBLE_KEYS) {
        const keyVariants = createKeyVariants(baseKey);
        
        for (const keyVariant of keyVariants) {
          try {
            // Legacy createDecipher method
            const decipher = crypto.createDecipher('aes256', keyVariant);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            JSON.parse(decrypted);
            return decrypted;
          } catch (e) {
            continue;
          }
          
          try {
            // Modern createDecipheriv method
            const iv = Buffer.from(ivHex, 'hex');
            const key = keyVariant.length === 64 
              ? Buffer.from(keyVariant, 'hex') 
              : crypto.createHash('sha256').update(keyVariant).digest();
            
            const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            JSON.parse(decrypted);
            return decrypted;
          } catch (e) {
            continue;
          }
        }
      }
    }
  }

  // Try legacy encryption without IV
  for (const baseKey of POSSIBLE_KEYS) {
    const keyVariants = createKeyVariants(baseKey);
    
    for (const keyVariant of keyVariants) {
      try {
        const decipher = crypto.createDecipher('aes256', keyVariant);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        JSON.parse(decrypted);
        return decrypted;
      } catch (e) {
        continue;
      }
    }
  }

  return null;
}

async function main() {
  console.log('🔧 Starting campaign data recovery...');
  
  try {
    const allCampaigns = await db.select().from(campaigns);
    console.log(`📊 Found ${allCampaigns.length} campaigns to recover`);
    
    if (allCampaigns.length === 0) {
      console.log('❌ No campaigns found in database');
      return;
    }
    
    let recovered = 0;
    let failed = 0;
    
    for (const campaign of allCampaigns) {
      console.log(`\n🔍 Processing campaign ${campaign.id}: ${campaign.name}`);
      
      try {
        const recoveredData = await attemptDataRecovery(campaign.encryptedData);
        
        if (recoveredData) {
          // Re-encrypt with current encryption method
          const reencryptedData = encrypt(recoveredData);
          
          // Update the campaign with re-encrypted data
          await db.update(campaigns)
            .set({ encryptedData: reencryptedData })
            .where(eq(campaigns.id, campaign.id));
          
          console.log(`✅ Successfully recovered campaign ${campaign.id}`);
          recovered++;
        } else {
          console.log(`❌ Failed to recover campaign ${campaign.id}`);
          failed++;
        }
      } catch (error) {
        console.error(`💥 Error processing campaign ${campaign.id}:`, error);
        failed++;
      }
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📈 Recovery Summary:`);
    console.log(`✅ Recovered: ${recovered}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${recovered + failed}`);
    
    if (recovered > 0) {
      console.log('\n🎉 Campaign data recovery completed successfully!');
    } else {
      console.log('\n😞 No campaigns could be recovered. Data may be corrupted or using unknown encryption.');
    }
    
  } catch (error) {
    console.error('💥 Fatal error during recovery:', error);
  }
  
  process.exit(0);
}

main();