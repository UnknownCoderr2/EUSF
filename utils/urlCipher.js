const crypto = require('crypto');

// AES-256-GCM
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM
const TAG_LENGTH = 16;

function getKey() {
  const envKey = process.env.URL_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
  if (envKey) {
    // ensure 32 bytes
    return crypto.createHash('sha256').update(envKey).digest();
  }
  console.warn('⚠️ URL encryption key not set (URL_ENCRYPTION_KEY or ENCRYPTION_KEY). Falling back to insecure default key. Set an env var to secure tokens.');
  return crypto.createHash('sha256').update('default-insecure-key-change-me').digest();
}

const KEY = getKey();

function base64UrlEncode(buf) {
  return buf.toString('base64');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64');
}

function encrypt(plainText) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // payload = iv + tag + encrypted
  const payload = Buffer.concat([iv, tag, encrypted]);
  return base64UrlEncode(payload);
}

function decrypt(token) {
  if (!token) throw new Error('Empty token');
  const payload = base64UrlDecode(token);
  if (payload.length < IV_LENGTH + TAG_LENGTH) throw new Error('Invalid token');
  const iv = payload.slice(0, IV_LENGTH);
  const tag = payload.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = payload.slice(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

module.exports = {
  encrypt,
  decrypt,
};
