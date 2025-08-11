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
  // Since all standard decryption methods fail, check if data is already decrypted
  if (!encryptedData) {
    throw new Error('No encrypted data provided');
  }
  
  // Try to parse as JSON first - maybe it's not encrypted at all
  try {
    const parsed = JSON.parse(encryptedData);
    console.log('Data appears to be unencrypted JSON, returning as-is');
    return encryptedData;
  } catch (e) {
    // Not JSON, continue with decryption attempts
  }
  // First check if it's base64 encoded (legacy format)
  try {
    const decoded = Buffer.from(encryptedData, 'base64').toString('utf8');
    JSON.parse(decoded); // Test if it's valid JSON
    return decoded;
  } catch (e) {
    // Not base64 or not valid JSON, continue with other methods
  }
  
  // Check if it's in hex format without IV (old format)
  try {
    const decoded = Buffer.from(encryptedData, 'hex').toString('utf8');
    JSON.parse(decoded); // Test if it's valid JSON
    return decoded;
  } catch (e) {
    // Not hex-encoded JSON, continue with encryption methods
  }
  
  // Check if it contains colon (IV:encrypted format)
  if (encryptedData.includes(':')) {
    const parts = encryptedData.split(':');
    if (parts.length === 2) {
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Try multiple key derivation methods with IV
      const keyMethods = [
        () => Buffer.from(ENCRYPTION_KEY, 'hex'), // Direct hex key (primary method)
        () => getKey(), // Current method (SHA256 if not hex)
        () => Buffer.from(ENCRYPTION_KEY.substring(0, 32).padEnd(32, '0'), 'utf8'), // Direct key
        () => crypto.createHash('md5').update(ENCRYPTION_KEY).digest(), // MD5 hash
      ];
      
      for (const keyMethod of keyMethods) {
        try {
          const key = keyMethod();
          const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          JSON.parse(decrypted); // Validate it's JSON
          return decrypted;
        } catch (error) {
          continue;
        }
      }
      
      // Try legacy decipher methods with IV - using the whole encrypted string 
      try {
        const decipher = crypto.createDecipher('aes256', ENCRYPTION_KEY);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        JSON.parse(decrypted); // Validate JSON
        return decrypted;
      } catch (legacyError) {
        // Continue to other methods
      }
      
      // Try legacy decipher methods with encrypted part only
      try {
        const decipher = crypto.createDecipher('aes256', ENCRYPTION_KEY);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        JSON.parse(decrypted); // Validate JSON
        return decrypted;
      } catch (legacyError) {
        // Try with different key derivation
        try {
          const legacyKey = crypto.createHash('md5').update(ENCRYPTION_KEY).digest('hex');
          const decipher = crypto.createDecipher('aes256', legacyKey);
          let decrypted = decipher.update(encrypted, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          return decrypted;
        } catch (e) {
          // Continue to other methods
        }
      }
    }
  }
  
  // Try legacy method without IV - comprehensive approach with various methods
  const legacyMethods = [
    () => {
      // Method 1: Direct createDecipher with aes256
      const decipher = crypto.createDecipher('aes256', ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    () => {
      // Method 2: Use the encryption key as a passphrase for the whole data
      const parts = encryptedData.split(':');
      if (parts.length === 2) {
        const decipher = crypto.createDecipher('aes256', ENCRYPTION_KEY);
        let decrypted = decipher.update(parts[1], 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }
      throw new Error('No colon found');
    },
    () => {
      // Method 3: Treat the entire string as the encrypted data (ignore colon)
      const dataWithoutColon = encryptedData.replace(':', '');
      const decipher = crypto.createDecipher('aes256', ENCRYPTION_KEY);
      let decrypted = decipher.update(dataWithoutColon, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    () => {
      // Method 4: MD5 hash of the key
      const legacyKey = crypto.createHash('md5').update(ENCRYPTION_KEY).digest('hex');
      const decipher = crypto.createDecipher('aes256', legacyKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    () => {
      // Method 5: Direct key with SHA256
      const sha256Key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest('hex');
      const decipher = crypto.createDecipher('aes256', sha256Key);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    () => {
      // Method 6: Try direct decryption with just the encrypted part and the key
      const parts = encryptedData.split(':');
      if (parts.length === 2) {
        const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
        let decrypted = decipher.update(parts[1], 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      }
      throw new Error('No colon found');
    }
  ];
  
  for (const method of legacyMethods) {
    try {
      const result = method();
      JSON.parse(result); // Validate it's JSON
      return result;
    } catch (e) {
      continue;
    }
  }
  
  // Silent fail - don't flood logs with decryption errors
  
  throw new Error(`Unable to decrypt campaign data with the provided encryption key. All standard AES decryption methods failed. The data appears to be encrypted with: IV format (${encryptedData.substring(0, 50)}...), but none of the attempted decryption keys or methods worked. Please verify the encryption key is correct.`);
}
