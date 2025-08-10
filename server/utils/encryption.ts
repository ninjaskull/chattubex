import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-here!';
const ALGORITHM = 'aes-256-cbc';

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
  
  const parts = encryptedData.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = getKey();
  
  try {
    // Try new encryption method first
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // If new method fails, try legacy method
    try {
      const decipher = crypto.createDecipher(ALGORITHM, key);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (legacyError) {
      throw new Error('Unable to decrypt data with either method');
    }
  }
}
