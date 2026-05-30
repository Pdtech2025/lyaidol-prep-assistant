/**
 * 认证与加密工具库
 * - AES-256-GCM 密码加密
 * - JWT Token 签发与验证
 * - 验证码生成
 */

import { SignJWT, jwtVerify } from 'jose';
import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

// ============ 配置 ============

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'lyaidol-b-platform-jwt-secret-key-2026'
);
const JWT_EXPIRES_IN = '8h';
const JWT_ISSUER = 'lyaidol-b-platform';

// AES-256-GCM 加密配置
const AES_KEY = Buffer.from(
  process.env.AES_ENCRYPTION_KEY || 'Ly1d0lBPl4tf0rmA3s256GcmK3y2026Sec', 
  'utf-8'
).subarray(0, 32); // 确保恰好32字节

// PBKDF2 配置
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_SALT_LENGTH = 16;
const PBKDF2_KEY_LENGTH = 64;

// ============ 密码加密 (PBKDF2 + SHA-512) ============

export function hashPassword(password: string): string {
  const salt = randomBytes(PBKDF2_SALT_LENGTH).toString('hex');
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEY_LENGTH, 'sha512').toString('hex');
  return hash === verifyHash;
}

// ============ AES-256-GCM 加密/解密 (前端传输加密) ============

export function aesEncrypt(plaintext: string): string {
  const iv = randomBytes(12); // GCM 推荐12字节IV
  const cipher = createCipheriv('aes-256-gcm', AES_KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  // 格式: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function aesDecrypt(encryptedData: string): string {
  const [ivHex, authTagHex, ciphertext] = encryptedData.split(':');
  if (!ivHex || !authTagHex || !ciphertext) {
    throw new Error('无效的加密数据格式');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv('aes-256-gcm', AES_KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============ JWT Token ============

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  tenantId: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      tenantId: payload.tenantId as string,
    };
  } catch {
    return null;
  }
}

// ============ 验证码生成 ============

export interface CaptchaData {
  id: string;
  answer: string;
  svg: string;
  createdAt: number;
}

const captchaStore = new Map<string, CaptchaData>();

// 清理过期验证码（5分钟过期）
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of captchaStore) {
    if (now - data.createdAt > 5 * 60 * 1000) {
      captchaStore.delete(id);
    }
  }
}, 60 * 1000);

function randomColor(): string {
  const r = Math.floor(Math.random() * 100 + 100);
  const g = Math.floor(Math.random() * 100 + 100);
  const b = Math.floor(Math.random() * 100 + 100);
  return `rgb(${r},${g},${b})`;
}

function generateSvgCaptcha(text: string): string {
  const width = 120;
  const height = 40;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
  
  // 背景
  svg += `<rect width="${width}" height="${height}" fill="#1a1d27" rx="4"/>`;
  
  // 干扰线
  for (let i = 0; i < 4; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${randomColor()}" stroke-width="1" opacity="0.5"/>`;
  }
  
  // 干扰点
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    svg += `<circle cx="${x}" cy="${y}" r="1" fill="${randomColor()}" opacity="0.5"/>`;
  }
  
  // 文字
  const chars = text.split('');
  const charWidth = (width - 20) / chars.length;
  chars.forEach((char, i) => {
    const x = 10 + i * charWidth + charWidth / 2;
    const y = height / 2 + (Math.random() * 10 - 5);
    const rotate = Math.random() * 20 - 10;
    svg += `<text x="${x}" y="${y}" fill="${randomColor()}" font-size="${18 + Math.random() * 6}" font-family="monospace" font-weight="bold" text-anchor="middle" dominant-baseline="central" transform="rotate(${rotate},${x},${y})">${char}</text>`;
  });
  
  svg += `</svg>`;
  return svg;
}

export function generateCaptcha(): CaptchaData {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let answer = '';
  for (let i = 0; i < 4; i++) {
    answer += chars[Math.floor(Math.random() * chars.length)];
  }
  
  const id = randomBytes(8).toString('hex');
  const data: CaptchaData = {
    id,
    answer,
    svg: generateSvgCaptcha(answer),
    createdAt: Date.now(),
  };
  
  captchaStore.set(id, data);
  return data;
}

export function verifyCaptcha(id: string, input: string): boolean {
  const data = captchaStore.get(id);
  if (!data) return false;
  if (Date.now() - data.createdAt > 5 * 60 * 1000) {
    captchaStore.delete(id);
    return false;
  }
  captchaStore.delete(id); // 一次性使用
  return data.answer.toUpperCase() === input.toUpperCase();
}

// ============ 模拟用户数据 ============

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  realName: string;
  tenantId: string;
  status: 'active' | 'disabled';
}

// 初始化默认管理员（密码: admin123）
const defaultUsers: AdminUser[] = [
  {
    id: 'u_001',
    username: 'admin',
    passwordHash: hashPassword('admin123'),
    role: 'super_admin',
    realName: '超级管理员',
    tenantId: 'tenant_001',
    status: 'active',
  },
  {
    id: 'u_002',
    username: 'operator',
    passwordHash: hashPassword('operator123'),
    role: 'operator',
    realName: '运营管理员',
    tenantId: 'tenant_001',
    status: 'active',
  },
];

const userStore = new Map<string, AdminUser>();
defaultUsers.forEach(u => userStore.set(u.username, u));

export function findUserByUsername(username: string): AdminUser | undefined {
  return userStore.get(username);
}

export function getAllUsers(): AdminUser[] {
  return Array.from(userStore.values());
}
