import crypto from 'crypto';
import { db } from '../db';
import { campaigns } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Multiple possible encryption keys that might have been used
const POSSIBLE_KEYS = [
  'default-key-32-chars-long-here!',
  'fallaowl-business-intelligence',
  'leadiq-pro-encryption-key-here',
  'campaign-management-key-2024',
  process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!'
];

// Multiple algorithms that might have been used
const POSSIBLE_ALGORITHMS = [
  'aes-256-cbc',
  'aes256',
  'aes-256-gcm'
];

function createKeyVariants(baseKey: string): string[] {
  const variants = [
    baseKey,
    crypto.createHash('sha256').update(baseKey).digest('hex'),
    crypto.createHash('md5').update(baseKey).digest('hex'),
    baseKey.padEnd(32, '0').substring(0, 32),
    crypto.createHash('sha256').update(baseKey).digest().toString('hex').substring(0, 32)
  ];
  return [...new Set(variants)]; // Remove duplicates
}

export async function attemptDataRecovery(encryptedData: string): Promise<string | null> {
  // Try all possible decryption methods
  
  // Method 1: Base64 decoding (unencrypted JSON)
  try {
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
    JSON.parse(decoded);
    return decoded;
  } catch (e) {
    // Continue to other methods
  }

  // Method 2: Hex decoding (unencrypted JSON)
  try {
    const decoded = Buffer.from(encryptedData, 'hex').toString('utf8');
    JSON.parse(decoded);
    return decoded;
  } catch (e) {
    // Continue to other methods
  }

  // Method 3: Direct JSON (already unencrypted)
  try {
    JSON.parse(encryptedData);
    return encryptedData;
  } catch (e) {
    // Continue to other methods
  }

  // Method 4: IV:encrypted format
  if (encryptedData.includes(':')) {
    const parts = encryptedData.split(':');
    if (parts.length === 2) {
      const ivHex = parts[0];
      const encrypted = parts[1];
      
      // Try different IV lengths and key combinations
      for (const baseKey of POSSIBLE_KEYS) {
        const keyVariants = createKeyVariants(baseKey);
        
        for (const keyVariant of keyVariants) {
          for (const algorithm of POSSIBLE_ALGORITHMS) {
            try {
              if (algorithm === 'aes256') {
                // Legacy createDecipher method
                const decipher = crypto.createDecipher(algorithm, keyVariant);
                let decrypted = decipher.update(encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                JSON.parse(decrypted);
                return decrypted;
              } else {
                // Modern createDecipheriv method
                const iv = Buffer.from(ivHex, 'hex');
                const key = keyVariant.length === 64 
                  ? Buffer.from(keyVariant, 'hex') 
                  : crypto.createHash('sha256').update(keyVariant).digest();
                
                const decipher = crypto.createDecipheriv(algorithm, key, iv);
                let decrypted = decipher.update(encrypted, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                JSON.parse(decrypted);
                return decrypted;
              }
            } catch (e) {
              // Continue trying other combinations
              continue;
            }
          }
        }
      }
    }
  }

  // Method 5: Legacy encryption without IV
  for (const baseKey of POSSIBLE_KEYS) {
    const keyVariants = createKeyVariants(baseKey);
    
    for (const keyVariant of keyVariants) {
      for (const algorithm of POSSIBLE_ALGORITHMS) {
        try {
          if (algorithm === 'aes256') {
            const decipher = crypto.createDecipher(algorithm, keyVariant);
            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            JSON.parse(decrypted);
            return decrypted;
          }
        } catch (e) {
          continue;
        }
      }
    }
  }

  return null;
}

export async function recoverCampaignData(campaignId: number): Promise<boolean> {
  try {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, campaignId));
    if (!campaign) {
      console.log(`Campaign ${campaignId} not found`);
      return false;
    }

    console.log(`Attempting to recover campaign ${campaignId}: ${campaign.name}`);
    
    const recoveredData = await attemptDataRecovery(campaign.encryptedData);
    if (recoveredData) {
      // Re-encrypt with current encryption method
      const { encrypt } = await import('./encryption.js');
      const reencryptedData = encrypt(recoveredData);
      
      // Update the campaign with re-encrypted data
      await db.update(campaigns)
        .set({ encryptedData: reencryptedData })
        .where(eq(campaigns.id, campaignId));
      
      console.log(`✓ Successfully recovered and re-encrypted campaign ${campaignId}`);
      return true;
    } else {
      console.log(`✗ Failed to recover campaign ${campaignId}`);
      return false;
    }
  } catch (error) {
    console.error(`Error recovering campaign ${campaignId}:`, error);
    return false;
  }
}

export async function recoverAllCampaigns(): Promise<{ recovered: number; failed: number }> {
  try {
    const allCampaigns = await db.select().from(campaigns);
    console.log(`Starting recovery for ${allCampaigns.length} campaigns...`);
    
    let recovered = 0;
    let failed = 0;
    
    for (const campaign of allCampaigns) {
      const success = await recoverCampaignData(campaign.id);
      if (success) {
        recovered++;
      } else {
        failed++;
      }
      
      // Add small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Recovery complete: ${recovered} recovered, ${failed} failed`);
    return { recovered, failed };
  } catch (error) {
    console.error('Error during bulk recovery:', error);
    return { recovered: 0, failed: 0 };
  }
}