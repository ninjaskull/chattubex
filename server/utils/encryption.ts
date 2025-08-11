import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!';
const ALGORITHM = 'aes-256-cbc';
const LEGACY_ALGORITHM = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes for AES-256
function getKey(): Buffer {
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
        () => getKey(), // Current method (SHA256)
        () => Buffer.from(ENCRYPTION_KEY.substring(0, 32).padEnd(32, '0'), 'utf8'), // Direct key
        () => crypto.createHash('md5').update(ENCRYPTION_KEY).digest(), // MD5 hash
        () => Buffer.from(ENCRYPTION_KEY, 'hex').subarray(0, 32), // Hex to buffer (if key is hex)
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
      
      // Try legacy decipher methods with IV
      try {
        const decipher = crypto.createDecipher('aes256', ENCRYPTION_KEY);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
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
  
  // Try legacy method without IV - multiple approaches
  const legacyMethods = [
    () => {
      const decipher = crypto.createDecipher('aes256', ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    () => {
      const legacyKey = crypto.createHash('md5').update(ENCRYPTION_KEY).digest('hex');
      const decipher = crypto.createDecipher('aes256', legacyKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    () => {
      const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    () => {
      // Try using the raw hex key directly
      const rawKey = Buffer.from(ENCRYPTION_KEY, 'hex').subarray(0, 32);
      const decipher = crypto.createDecipher('aes256', rawKey.toString('hex'));
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
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
  
  // If all methods fail, return the data as-is (might be unencrypted)
  try {
    JSON.parse(encryptedData); // Test if it's already valid JSON
    return encryptedData;
  } catch (e) {
    throw new Error(`Unable to decrypt data: ${encryptedData.substring(0, 50)}...`);
  }
}
