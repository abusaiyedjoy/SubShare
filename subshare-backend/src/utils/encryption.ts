import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key!!';
const IV_LENGTH = 16;

/**
 * Ensure encryption key is 32 bytes
 */
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY;
  
  if (key.length === 32) {
    return Buffer.from(key);
  }
  
  // Hash the key to ensure it's 32 bytes
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt sensitive data (like subscription credentials)
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt subscription credentials
 */
export function encryptCredentials(username: string, password: string): {
  encrypted_username: string;
  encrypted_password: string;
} {
  return {
    encrypted_username: encrypt(username),
    encrypted_password: encrypt(password),
  };
}

/**
 * Decrypt subscription credentials
 */
export function decryptCredentials(encrypted_username: string, encrypted_password: string): {
  username: string;
  password: string;
} {
  return {
    username: decrypt(encrypted_username),
    password: decrypt(encrypted_password),
  };
}

/**
 * Hash password using bcrypt-compatible method
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}