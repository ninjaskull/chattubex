#!/usr/bin/env node

// Script to test different encryption keys against your old campaign data
import crypto from 'crypto';

const POSSIBLE_KEYS = [
  'your-32-character-encryption-key-here', // Most likely placeholder key
  'your-32-character-encryption-key',      // Variant without 'here'
  'default-key-32-chars-long-here!',       // Current working key
  'fallaowl-business-intelligence',         // From scripts
  'leadiq-pro-encryption-key-here',         // Legacy variant
  'campaign-management-key-2024',           // Another legacy
  'sunil123',                               // Based on DB pattern
];

function testDecryption(encryptedData, key) {
  try {
    // Method 1: IV:encrypted format (current)
    if (encryptedData.includes(':')) {
      const parts = encryptedData.split(':');
      if (parts.length === 2) {
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        // Hash the key to 32 bytes
        const derivedKey = crypto.createHash('sha256').update(key).digest();
        const decipher = crypto.createDecipheriv('aes-256-cbc', derivedKey, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        // Test if it's valid JSON
        JSON.parse(decrypted);
        return { success: true, method: 'AES-256-CBC with IV', data: decrypted };
      }
    }
    
    // Method 2: Legacy decipher
    const decipher = crypto.createDecipher('aes256', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    JSON.parse(decrypted);
    return { success: true, method: 'Legacy AES256', data: decrypted };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test with a sample from your logs
const sampleEncryptedData = "60daa69043444bd153c987ed40f4a78a:531a3169f6726f546f4a8b10f7a75df";

console.log('Testing decryption with various keys...\n');

for (const key of POSSIBLE_KEYS) {
  console.log(`Testing key: "${key}"`);
  const result = testDecryption(sampleEncryptedData, key);
  
  if (result.success) {
    console.log(`✅ SUCCESS with method: ${result.method}`);
    console.log(`Data preview: ${result.data.substring(0, 100)}...`);
    break;
  } else {
    console.log(`❌ Failed: ${result.error}`);
  }
  console.log('');
}

console.log('\nTo find your original key on the old server, check:');
console.log('1. .env file in your app directory');
console.log('2. Environment variables: echo $ENCRYPTION_KEY');
console.log('3. Docker/PM2 config files');
console.log('4. Server startup scripts');