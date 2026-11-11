import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  CertificateRecord,
  ContactMessage,
  Course,
  CourseEnquiry,
  CourseMaterial,
  ProjectEnquiry,
  SiteSettings,
  WebsiteContent,
} from '../types.ts';
import {
  SEED_CERTIFICATES,
  SEED_CONTENT,
  SEED_COURSES,
  SEED_MATERIALS,
  SEED_SETTINGS,
} from './seedData.ts';

export interface AdminAccount {
  email: string;
  passwordSalt: string;
  passwordHash: string;
}

export interface DatabaseState {
  admin: AdminAccount;
  sessionSecret: string;
  content: WebsiteContent;
  settings: SiteSettings;
  courses: Course[];
  materials: CourseMaterial[];
  courseEnquiries: CourseEnquiry[];
  projectEnquiries: ProjectEnquiry[];
  certificates: CertificateRecord[];
  contactMessages: ContactMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'apjtech-db.json');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

function ensureDirs(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash: derived };
}

export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const { hash } = hashPassword(password, salt);
  const bufA = Buffer.from(hash, 'hex');
  const bufB = Buffer.from(storedHash, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function createInitialState(): DatabaseState {
  const defaultEmail = (process.env.ADMIN_EMAIL || 'bharathan45k@gmail.com').trim().toLowerCase();
  const defaultPass = process.env.ADMIN_PASSWORD || 'APJTech@2026';
  const { salt, hash } = hashPassword(defaultPass);
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

  return {
    admin: {
      email: defaultEmail,
      passwordSalt: salt,
      passwordHash: hash,
    },
    sessionSecret,
    content: structuredClone(SEED_CONTENT),
    settings: structuredClone(SEED_SETTINGS),
    courses: structuredClone(SEED_COURSES),
    materials: structuredClone(SEED_MATERIALS),
    courseEnquiries: [],
    projectEnquiries: [],
    certificates: structuredClone(SEED_CERTIFICATES),
    contactMessages: [],
  };
}

let cachedState: DatabaseState | null = null;

export function getDb(): DatabaseState {
  ensureDirs();
  if (cachedState) return cachedState;

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<DatabaseState>;
      const fallback = createInitialState();
      cachedState = {
        admin: parsed.admin || fallback.admin,
        sessionSecret: parsed.sessionSecret || fallback.sessionSecret,
        content: parsed.content || fallback.content,
        settings: parsed.settings || fallback.settings,
        courses: Array.isArray(parsed.courses) ? parsed.courses : fallback.courses,
        materials: Array.isArray(parsed.materials) ? parsed.materials : fallback.materials,
        courseEnquiries: Array.isArray(parsed.courseEnquiries) ? parsed.courseEnquiries : [],
        projectEnquiries: Array.isArray(parsed.projectEnquiries) ? parsed.projectEnquiries : [],
        certificates: Array.isArray(parsed.certificates) ? parsed.certificates : fallback.certificates,
        contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
      };
      return cachedState;
    } catch {
      cachedState = createInitialState();
      saveDb(cachedState);
      return cachedState;
    }
  }

  cachedState = createInitialState();
  saveDb(cachedState);
  return cachedState;
}

export function saveDb(state: DatabaseState): void {
  ensureDirs();
  cachedState = state;
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_PATH);
}

export function signSessionToken(email: string, secret: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const payload = Buffer.from(JSON.stringify({ email, exp }), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string, secret: string): { email: string } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const bufSig = Buffer.from(sig);
  const bufExp = Buffer.from(expectedSig);
  if (bufSig.length !== bufExp.length || !crypto.timingSafeEqual(bufSig, bufExp)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      email?: string;
      exp?: number;
    };
    if (!parsed.email || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return { email: parsed.email };
  } catch {
    return null;
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
