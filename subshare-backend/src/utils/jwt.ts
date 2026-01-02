import { JWTPayload } from '../types';


function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}


function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

async function generateSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureString = String.fromCharCode(...signatureArray);
  
  return base64UrlEncode(signatureString);
}


export async function generateToken(payload: JWTPayload, secret: string): Promise<string> {
  try {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };
    
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 24 * 60 * 60; // 24 hours
    
    const claims = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };
    
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(claims));
    
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = await generateSignature(data, secret);
    
    return `${data}.${signature}`;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload> {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = await generateSignature(data, secret);
    
    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }
    
    // Decode payload
    const payloadJson = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(payloadJson);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token has expired');
    }
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Token verification failed');
  }
}


export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}