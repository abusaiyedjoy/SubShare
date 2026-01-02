
 // Hash password using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verify password by comparing hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
}

// Get CryptoKey for encryption/decryption
async function getEncryptionKey(key: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  
  // Hash the key to ensure it's 256 bits
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  
  return await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt text using AES-GCM
export async function encrypt(text: string, encryptionKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Get encryption key
    const key = await getEncryptionKey(encryptionKey);
    
    // Encrypt data
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv, 0);
    result.set(encryptedArray, iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Decrypt text using AES-GCM
export async function decrypt(encryptedText: string, encryptionKey: string): Promise<string> {
  try {
    // Convert from base64
    const encryptedData = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);
    
    // Get encryption key
    const key = await getEncryptionKey(encryptionKey);
    
    // Decrypt data
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Encrypt subscription credentials
export async function encryptCredentials(
  username: string, 
  password: string,
  encryptionKey: string
): Promise<{
  encrypted_username: string;
  encrypted_password: string;
}> {
  return {
    encrypted_username: await encrypt(username, encryptionKey),
    encrypted_password: await encrypt(password, encryptionKey),
  };
}

// Decrypt subscription credentials
export async function decryptCredentials(
  encrypted_username: string, 
  encrypted_password: string,
  encryptionKey: string
): Promise<{
  username: string;
  password: string;
}> {
  return {
    username: await decrypt(encrypted_username, encryptionKey),
    password: await decrypt(encrypted_password, encryptionKey),
  };
}