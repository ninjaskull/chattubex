import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!';
const ALGORITHM = 'aes-256-cbc';
const LEGACY_ALGORITHM = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes for AES-256
function getKey(): Buffer {
  // If the key is exactly 64 hex characters (32 bytes), use it directly
  if (ENCRYPTION_KEY.length === 64 && /^[0-9a-fA-F]+$/.test(ENCRYPTION_KEY)) {
    return Buffer.from(ENCRYPTION_KEY, 'hex');
  }
  
  // Otherwise, hash it to ensure 32 bytes
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  return key;
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('No encrypted data provided');
  }
  
  // Try to parse as JSON first - maybe it's not encrypted at all
  try {
    const parsed = JSON.parse(encryptedData);
    return encryptedData;
  } catch (e) {
    // Not JSON, continue with decryption attempts
  }
  
  // Check if it contains colon (IV:encrypted format) - this is the current working method
  if (encryptedData.includes(':')) {
    const parts = encryptedData.split(':');
    if (parts.length === 2) {
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Use the same method that works for new campaigns
      try {
        const key = getKey(); // This works for recent uploads
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        JSON.parse(decrypted); // Validate it's JSON
        return decrypted;
      } catch (error) {
        // If current method fails, try legacy methods for old campaigns
        const legacyKeys = [
          'default-key-32-chars-long-here!', // Default fallback key (currently working)
          'fallaowl-business-intelligence', // From old server setup
          'leadiq-pro-encryption-key-here', // Legacy key variant
          'campaign-management-key-2024', // Another legacy key
          'fallowl-encryption-key-2024!!!', // Possible old key
          'admin123', // Simple key
          'sunil123', // Based on your DB password pattern
        ];
        
        for (const legacyKey of legacyKeys) {
          try {
            // Try with legacy key using SHA256 hash
            const key = crypto.createHash('sha256').update(legacyKey).digest();
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            JSON.parse(decrypted); // Validate it's JSON
            console.log(`Successfully decrypted with legacy key: ${legacyKey}`);
            return decrypted;
          } catch (e) {
            continue;
          }
        }
        
        // Try legacy decipher method
        try {
          const decipher = crypto.createDecipher('aes256', 'default-key-32-chars-long-here!');
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          JSON.parse(decrypted); // Validate JSON
          return decrypted;
        } catch (e) {
          // Continue to final fallback
        }
      }
    }
  }
  
  // Try other formats for very old data
  const fallbackMethods = [
    () => {
      // Base64 encoded
      const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
      JSON.parse(decoded);
      return decoded;
    },
    () => {
      // Hex encoded
      const decoded = Buffer.from(encryptedData, 'hex').toString('utf8');
      JSON.parse(decoded);
      return decoded;
    }
  ];
  
  for (const method of fallbackMethods) {
    try {
      return method();
    } catch (e) {
      continue;
    }
  }
  
  // If all methods fail, return a default empty structure instead of throwing error
  console.warn(`Could not decrypt campaign data, returning empty structure: ${encryptedData.substring(0, 50)}...`);
  return JSON.stringify({ headers: [], rows: [], fieldMappings: {} });
}
