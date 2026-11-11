import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
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

const REPO_DATA_DIR = path.resolve(process.cwd(), 'data');
const REPO_DB_PATH = path.join(REPO_DATA_DIR, 'apjtech-db.json');
const REPO_UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'apjtech-data');
const TMP_DB_PATH = path.join(TMP_DATA_DIR, 'apjtech-db.json');
const TMP_UPLOADS_DIR = path.join(os.tmpdir(), 'apjtech-uploads');

function isDirWritable(dirPath: string): boolean {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const probe = path.join(dirPath, `.write-test-${process.pid}`);
    fs.writeFileSync(probe, '1');
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}

const USE_TMP_FALLBACK = Boolean(process.env.VERCEL) || !isDirWritable(REPO_DATA_DIR);
const ACTIVE_DATA_DIR = USE_TMP_FALLBACK ? TMP_DATA_DIR : REPO_DATA_DIR;
const ACTIVE_DB_PATH = USE_TMP_FALLBACK ? TMP_DB_PATH : REPO_DB_PATH;
export const UPLOADS_DIR = USE_TMP_FALLBACK ? TMP_UPLOADS_DIR : REPO_UPLOADS_DIR;

function ensureDirs(): void {
  if (!fs.existsSync(ACTIVE_DATA_DIR)) {
    fs.mkdirSync(ACTIVE_DATA_DIR, { recursive: true });
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
  const sessionSecret =
    process.env.SESSION_SECRET ||
    crypto
      .createHash('sha256')
      .update(`apjtech-session:${defaultEmail}:${defaultPass}`)
      .digest('hex');

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

function hydrateParsed(parsed: Partial<DatabaseState>): DatabaseState {
  const fallback = createInitialState();
  return {
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
}

export function getDb(): DatabaseState {
  ensureDirs();
  if (cachedState) return cachedState;

  const candidatePaths = USE_TMP_FALLBACK ? [ACTIVE_DB_PATH, REPO_DB_PATH] : [ACTIVE_DB_PATH];
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      try {
        const raw = fs.readFileSync(candidate, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DatabaseState>;
        cachedState = hydrateParsed(parsed);
        if (USE_TMP_FALLBACK && candidate === REPO_DB_PATH) {
          saveDb(cachedState);
        }
        return cachedState;
      } catch {
        // continue to next candidate or fallback
      }
    }
  }

  cachedState = createInitialState();
  saveDb(cachedState);
  return cachedState;
}

export function saveDb(state: DatabaseState): void {
  ensureDirs();
  cachedState = state;
  const tmpPath = `${ACTIVE_DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmpPath, ACTIVE_DB_PATH);
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
