import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { generateStudyMaterialFile } from './fileGen.ts';
import {
  UPLOADS_DIR,
  createId,
  getDb,
  hashPassword,
  saveDb,
  signSessionToken,
  verifyPassword,
  verifySessionToken,
} from './store.ts';
import type {
  CertificateRecord,
  ContactMessage,
  Course,
  CourseEnquiry,
  CourseMaterial,
  EnquiryStatus,
  ProjectEnquiry,
} from '../types.ts';

const COOKIE_NAME = 'apj_admin_session';

const VALID_ENQUIRY_STATUSES: EnquiryStatus[] = [
  'New',
  'Contacted',
  'In Progress',
  'Completed',
  'Rejected',
];

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    result[key] = decodeURIComponent(val);
  }
  return result;
}

function getAuthenticatedAdmin(req: Request): { email: string } | null {
  const db = getDb();
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  const token = cookieToken || bearerToken;
  if (!token) return null;
  return verifySessionToken(token, db.sessionSecret);
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    res.status(401).json({ error: 'Unauthorized. Please sign in to the Admin Dashboard.' });
    return;
  }
  next();
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function sanitizeString(value: unknown, maxLen = 4000): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getNextCertificateId(certificates: CertificateRecord[]): string {
  const yr = new Date().getFullYear();
  let maxSeq = 0;
  const prefix = `APJ-${yr}-`;
  for (const cert of certificates) {
    if (cert.isDemo) continue;
    const upper = cert.certificateId.toUpperCase();
    const yearMatch = upper.match(new RegExp(`^APJ-${yr}-(\\d+)$`));
    if (yearMatch) {
      const num = Number.parseInt(yearMatch[1], 10);
      if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
      continue;
    }
    const genericMatch = upper.match(/^APJ-(\d+)$/);
    if (genericMatch) {
      const num = Number.parseInt(genericMatch[1], 10);
      if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
    }
  }
  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(3, '0')}`;
  while (certificates.some((c) => c.certificateId.toUpperCase() === candidate)) {
    nextSeq += 1;
    candidate = `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }
  return candidate;
}

function buildSessionCookie(req: Request, value: string, maxAgeSeconds: number): string {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  const isHttps = req.secure || forwardedProto.includes('https');
  const sameSite = isHttps ? 'SameSite=None; Secure' : 'SameSite=Lax';
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; ${sameSite}; Max-Age=${maxAgeSeconds}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    getDb();
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '').slice(0, 12);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .slice(0, 50);
    cb(null, `${Date.now()}_${base || 'file'}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export function createApiApp(): Express {
  getDb();

  const app = express();
  app.use((req, _res, next) => {
    const rawUrl = req.url || '/';
    const headerRoute =
      typeof req.headers['x-apj-route'] === 'string' ? req.headers['x-apj-route'].trim() : '';
    if (rawUrl.includes('_route=') || rawUrl.includes('__apjPath=') || headerRoute) {
      try {
        const parsed = new URL(rawUrl, 'http://localhost');
        const targetRoute =
          parsed.searchParams.get('_route') ||
          parsed.searchParams.get('__apjPath') ||
          headerRoute;
        if (targetRoute) {
          parsed.searchParams.delete('_route');
          parsed.searchParams.delete('__apjPath');
          const [routePath, routeQuery = ''] = targetRoute.split('?');
          const mergedQuery = new URLSearchParams(routeQuery);
          parsed.searchParams.forEach((value, key) => {
            mergedQuery.set(key, value);
          });
          const qs = mergedQuery.toString();
          const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`;
          req.url = `${normalized}${qs ? `?${qs}` : ''}`;
        }
      } catch {
        // Keep original req.url on malformed query
      }
    }
    next();
  });
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'apj-tech-api' });
  });

  // ==========================================
  // PUBLIC APIs
  // ==========================================

  app.get('/api/public/bootstrap', (_req, res) => {
    const db = getDb();
    res.json({
      content: db.content,
      settings: db.settings,
      courses: db.courses.filter((c) => c.published),
      materials: db.materials.filter((m) => m.published),
    });
  });

  app.get('/api/courses', (_req, res) => {
    const db = getDb();
    res.json(db.courses.filter((c) => c.published));
  });

  app.get('/api/courses/:slug', (req, res) => {
    const db = getDb();
    const course = db.courses.find((c) => c.slug === req.params.slug && c.published);
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    const relatedMaterials = db.materials.filter(
      (m) =>
        m.published &&
        m.courseCategory.toLowerCase() === course.title.toLowerCase()
    );
    res.json({ course, materials: relatedMaterials });
  });

  app.get('/api/materials', (_req, res) => {
    const db = getDb();
    res.json(db.materials.filter((m) => m.published));
  });

  app.get('/api/materials/:id/download', (req, res) => {
    const db = getDb();
    const admin = getAuthenticatedAdmin(req);
    const material = db.materials.find((m) => m.id === req.params.id);

    if (!material || (!material.published && !admin)) {
      res.status(404).json({ error: 'Study material not found.' });
      return;
    }

    if (material.storedFileName) {
      const diskPath = path.join(UPLOADS_DIR, path.basename(material.storedFileName));
      if (fs.existsSync(diskPath)) {
        res.download(diskPath, material.fileName || material.storedFileName);
        return;
      }
    }

    const generated = generateStudyMaterialFile(material);
    res.setHeader('Content-Type', generated.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${generated.fileName.replace(/"/g, '')}"`
    );
    res.send(generated.buffer);
  });

  app.get('/api/certificates/verify/:certificateId', (req, res) => {
    const db = getDb();
    const targetId = sanitizeString(req.params.certificateId, 80).toUpperCase();
    if (!targetId) {
      res.status(400).json({ error: 'Please provide a Certificate ID.' });
      return;
    }

    const cert = db.certificates.find(
      (c) => c.certificateId.toUpperCase() === targetId
    );
    if (!cert) {
      res.status(404).json({
        verified: false,
        error: `No certificate record found for ID "${targetId}".`,
      });
      return;
    }

    if (cert.status === 'Revoked') {
      res.json({
        verified: false,
        revoked: true,
        certificate: {
          certificateId: cert.certificateId,
          studentName: cert.studentName,
          courseName: cert.courseName,
          completionDate: cert.completionDate,
          status: cert.status,
          isDemo: cert.isDemo,
        },
        message: 'This certificate has been revoked by APJ Tech Administration.',
      });
      return;
    }

    res.json({
      verified: true,
      certificate: {
        id: cert.id,
        certificateId: cert.certificateId,
        studentName: cert.studentName,
        courseName: cert.courseName,
        completionDate: cert.completionDate,
        issuedAt: cert.issuedAt,
        isDemo: cert.isDemo,
        status: cert.status,
        authorizedSignatory: cert.authorizedSignatory,
      },
    });
  });

  app.post('/api/course-enquiries', (req, res) => {
    const db = getDb();
    const studentName = sanitizeString(req.body?.studentName, 120);
    const email = sanitizeString(req.body?.email, 160);
    const phone = sanitizeString(req.body?.phone, 40);
    const college = sanitizeString(req.body?.college, 180);
    const selectedCourse = sanitizeString(req.body?.selectedCourse, 160);
    const message = sanitizeString(req.body?.message, 2000);

    if (!studentName || !isValidEmail(email) || !phone || !selectedCourse) {
      res.status(400).json({
        error: 'Student name, valid email, phone number, and selected course are required.',
      });
      return;
    }

    const now = new Date().toISOString();
    const record: CourseEnquiry = {
      id: createId('ce'),
      studentName,
      email,
      phone,
      college: college || 'Not specified',
      selectedCourse,
      message,
      enquiryDate: now,
      status: 'New',
      internalNotes: '',
      updatedAt: now,
    };

    db.courseEnquiries.unshift(record);
    saveDb(db);
    res.status(201).json({ success: true, enquiry: record });
  });

  app.post('/api/project-enquiries', (req, res) => {
    const db = getDb();
    const studentName = sanitizeString(req.body?.studentName, 120);
    const email = sanitizeString(req.body?.email, 160);
    const whatsappNumber = sanitizeString(req.body?.whatsappNumber, 40);
    const collegeName = sanitizeString(req.body?.collegeName, 180);
    const department = sanitizeString(req.body?.department, 140);
    const projectType = sanitizeString(req.body?.projectType, 80) as ProjectEnquiry['projectType'];
    const projectTitle = sanitizeString(req.body?.projectTitle, 200);
    const preferredTechnology = sanitizeString(req.body?.preferredTechnology, 200);
    const projectDescription = sanitizeString(req.body?.projectDescription, 4000);
    const requiredSupport = sanitizeString(req.body?.requiredSupport, 240);

    if (
      !studentName ||
      !isValidEmail(email) ||
      !whatsappNumber ||
      !collegeName ||
      !department ||
      !projectType ||
      !projectTitle ||
      !projectDescription
    ) {
      res.status(400).json({
        error: 'Please complete all required student and project fields with a valid email.',
      });
      return;
    }

    const now = new Date().toISOString();
    const record: ProjectEnquiry = {
      id: createId('pe'),
      studentName,
      email,
      whatsappNumber,
      collegeName,
      department,
      projectType,
      projectTitle,
      preferredTechnology: preferredTechnology || 'Flexible / Open to Mentor Advice',
      projectDescription,
      requiredSupport: requiredSupport || 'Full Project Guidance',
      enquiryDate: now,
      status: 'New',
      assignedTo: '',
      internalNotes: '',
      updatedAt: now,
    };

    db.projectEnquiries.unshift(record);
    saveDb(db);
    res.status(201).json({ success: true, enquiry: record });
  });

  app.post('/api/contact-messages', (req, res) => {
    const db = getDb();
    const name = sanitizeString(req.body?.name, 120);
    const email = sanitizeString(req.body?.email, 160);
    const phone = sanitizeString(req.body?.phone, 40);
    const subject = sanitizeString(req.body?.subject, 180);
    const message = sanitizeString(req.body?.message, 3000);

    if (!name || !isValidEmail(email) || !subject || !message) {
      res.status(400).json({
        error: 'Name, valid email, subject, and message are required.',
      });
      return;
    }

    const now = new Date().toISOString();
    const record: ContactMessage = {
      id: createId('msg'),
      name,
      email,
      phone,
      subject,
      message,
      createdAt: now,
      status: 'Unread',
      internalNotes: '',
      updatedAt: now,
    };

    db.contactMessages.unshift(record);
    saveDb(db);
    res.status(201).json({ success: true, record });
  });

  // ==========================================
  // ADMIN AUTH APIs
  // ==========================================

  app.post('/api/admin/login', (req, res) => {
    const db = getDb();
    const email = sanitizeString(req.body?.email, 160).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (
      email !== db.admin.email.toLowerCase() ||
      !verifyPassword(password, db.admin.passwordSalt, db.admin.passwordHash)
    ) {
      res.status(401).json({ error: 'Invalid admin email or password.' });
      return;
    }

    const token = signSessionToken(db.admin.email, db.sessionSecret);
    res.setHeader('Set-Cookie', buildSessionCookie(req, token, 60 * 60 * 24 * 7));
    res.json({ authenticated: true, admin: { email: db.admin.email }, token });
  });

  app.post('/api/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', buildSessionCookie(req, '', 0));
    res.json({ authenticated: false });
  });

  app.get('/api/admin/me', (req, res) => {
    const admin = getAuthenticatedAdmin(req);
    if (!admin) {
      res.json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, admin });
  });

  // ==========================================
  // PROTECTED ADMIN APIs
  // ==========================================

  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    const db = getDb();
    const breakdown: Record<EnquiryStatus, number> = {
      New: 0,
      Contacted: 0,
      'In Progress': 0,
      Completed: 0,
      Rejected: 0,
    };

    for (const item of db.courseEnquiries) {
      if (item.status in breakdown) breakdown[item.status] += 1;
    }
    for (const item of db.projectEnquiries) {
      if (item.status in breakdown) breakdown[item.status] += 1;
    }

    const realCertificates = db.certificates.filter((c) => !c.isDemo);

    res.json({
      stats: {
        totalCourseEnquiries: db.courseEnquiries.length,
        totalProjectEnquiries: db.projectEnquiries.length,
        totalCourses: db.courses.length,
        publishedCourses: db.courses.filter((c) => c.published).length,
        totalMaterials: db.materials.length,
        publishedMaterials: db.materials.filter((m) => m.published).length,
        totalCertificatesIssued: realCertificates.length,
        totalContactMessages: db.contactMessages.length,
      },
      enquiryStatusBreakdown: breakdown,
      recentCourseEnquiries: db.courseEnquiries.slice(0, 5),
      recentProjectEnquiries: db.projectEnquiries.slice(0, 5),
      recentCertificates: realCertificates.slice(0, 5),
      recentMessages: db.contactMessages.slice(0, 5),
    });
  });

  app.post('/api/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const ext = path.extname(req.file.originalname).replace('.', '').toUpperCase() || 'FILE';
    res.json({
      fileUrl: `/uploads/${req.file.filename}`,
      storedFileName: req.file.filename,
      fileName: req.file.originalname,
      fileType: ext,
      fileSizeLabel: formatBytes(req.file.size),
    });
  });

  // Admin Courses CRUD
  app.get('/api/admin/courses', requireAdmin, (_req, res) => {
    res.json(getDb().courses);
  });

  app.post('/api/admin/courses', requireAdmin, (req, res) => {
    const db = getDb();
    const title = sanitizeString(req.body?.title, 160);
    if (!title) {
      res.status(400).json({ error: 'Course title is required.' });
      return;
    }
    const baseSlug = slugify(sanitizeString(req.body?.slug, 100) || title) || createId('course');
    const slugExists = db.courses.some((c) => c.slug === baseSlug);
    const slug = slugExists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
    const now = new Date().toISOString();

    const course: Course = {
      id: createId('course'),
      slug,
      title,
      category: sanitizeString(req.body?.category, 120) || 'Online IT Training',
      shortDescription: sanitizeString(req.body?.shortDescription, 400),
      description: sanitizeString(req.body?.description, 4000),
      imageUrl: sanitizeString(req.body?.imageUrl, 500),
      published: Boolean(req.body?.published),
      syllabusOverview: sanitizeString(req.body?.syllabusOverview, 1200),
      modules: Array.isArray(req.body?.modules) ? req.body.modules : [],
      learningOutcomes: Array.isArray(req.body?.learningOutcomes) ? req.body.learningOutcomes : [],
      sampleLessonTitle: sanitizeString(req.body?.sampleLessonTitle, 200),
      sampleLessonContent: sanitizeString(req.body?.sampleLessonContent, 4000),
      sampleLessonCode: sanitizeString(req.body?.sampleLessonCode, 4000),
      practiceExercises: Array.isArray(req.body?.practiceExercises) ? req.body.practiceExercises : [],
      sampleProjectTitle: sanitizeString(req.body?.sampleProjectTitle, 200),
      sampleProjectDescription: sanitizeString(req.body?.sampleProjectDescription, 2000),
      createdAt: now,
      updatedAt: now,
    };

    db.courses.push(course);
    saveDb(db);
    res.status(201).json(course);
  });

  app.put('/api/admin/courses/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.courses.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    const existing = db.courses[idx];
    const updated: Course = {
      ...existing,
      title: sanitizeString(req.body?.title, 160) || existing.title,
      slug: req.body?.slug ? slugify(req.body.slug) || existing.slug : existing.slug,
      category:
        req.body?.category !== undefined
          ? sanitizeString(req.body.category, 120)
          : existing.category,
      shortDescription:
        req.body?.shortDescription !== undefined
          ? sanitizeString(req.body.shortDescription, 400)
          : existing.shortDescription,
      description:
        req.body?.description !== undefined
          ? sanitizeString(req.body.description, 4000)
          : existing.description,
      imageUrl:
        req.body?.imageUrl !== undefined
          ? sanitizeString(req.body.imageUrl, 500)
          : existing.imageUrl,
      published:
        typeof req.body?.published === 'boolean' ? req.body.published : existing.published,
      syllabusOverview:
        req.body?.syllabusOverview !== undefined
          ? sanitizeString(req.body.syllabusOverview, 1200)
          : existing.syllabusOverview,
      modules: Array.isArray(req.body?.modules) ? req.body.modules : existing.modules,
      learningOutcomes: Array.isArray(req.body?.learningOutcomes)
        ? req.body.learningOutcomes
        : existing.learningOutcomes,
      sampleLessonTitle:
        req.body?.sampleLessonTitle !== undefined
          ? sanitizeString(req.body.sampleLessonTitle, 200)
          : existing.sampleLessonTitle,
      sampleLessonContent:
        req.body?.sampleLessonContent !== undefined
          ? sanitizeString(req.body.sampleLessonContent, 4000)
          : existing.sampleLessonContent,
      sampleLessonCode:
        req.body?.sampleLessonCode !== undefined
          ? sanitizeString(req.body.sampleLessonCode, 4000)
          : existing.sampleLessonCode,
      practiceExercises: Array.isArray(req.body?.practiceExercises)
        ? req.body.practiceExercises
        : existing.practiceExercises,
      sampleProjectTitle:
        req.body?.sampleProjectTitle !== undefined
          ? sanitizeString(req.body.sampleProjectTitle, 200)
          : existing.sampleProjectTitle,
      sampleProjectDescription:
        req.body?.sampleProjectDescription !== undefined
          ? sanitizeString(req.body.sampleProjectDescription, 2000)
          : existing.sampleProjectDescription,
      updatedAt: new Date().toISOString(),
    };
    db.courses[idx] = updated;
    saveDb(db);
    res.json(updated);
  });

  app.delete('/api/admin/courses/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.courses.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }
    db.courses.splice(idx, 1);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Admin Materials CRUD
  app.get('/api/admin/materials', requireAdmin, (_req, res) => {
    res.json(getDb().materials);
  });

  app.post('/api/admin/materials', requireAdmin, (req, res) => {
    const db = getDb();
    const title = sanitizeString(req.body?.title, 180);
    if (!title) {
      res.status(400).json({ error: 'Material title is required.' });
      return;
    }
    const id = createId('mat');
    const now = new Date().toISOString();
    const storedFileName = sanitizeString(req.body?.storedFileName, 260);
    const fileName = sanitizeString(req.body?.fileName, 200) || `${slugify(title) || id}.pdf`;

    const material: CourseMaterial = {
      id,
      title,
      description: sanitizeString(req.body?.description, 1000),
      courseCategory: sanitizeString(req.body?.courseCategory, 120) || 'General',
      fileType: sanitizeString(req.body?.fileType, 30) || 'PDF',
      fileName,
      storedFileName,
      fileUrl: `/api/materials/${id}/download`,
      fileSizeLabel: sanitizeString(req.body?.fileSizeLabel, 40) || 'Study File',
      previewContent: sanitizeString(req.body?.previewContent, 12000),
      published: typeof req.body?.published === 'boolean' ? req.body.published : true,
      createdAt: now,
      updatedAt: now,
    };

    db.materials.unshift(material);
    saveDb(db);
    res.status(201).json(material);
  });

  app.put('/api/admin/materials/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.materials.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Material not found.' });
      return;
    }
    const existing = db.materials[idx];
    const updated: CourseMaterial = {
      ...existing,
      title: sanitizeString(req.body?.title, 180) || existing.title,
      description:
        req.body?.description !== undefined
          ? sanitizeString(req.body.description, 1000)
          : existing.description,
      courseCategory:
        req.body?.courseCategory !== undefined
          ? sanitizeString(req.body.courseCategory, 120)
          : existing.courseCategory,
      published:
        typeof req.body?.published === 'boolean' ? req.body.published : existing.published,
      previewContent:
        req.body?.previewContent !== undefined
          ? sanitizeString(req.body.previewContent, 12000)
          : existing.previewContent,
      updatedAt: new Date().toISOString(),
    };
    db.materials[idx] = updated;
    saveDb(db);
    res.json(updated);
  });

  app.delete('/api/admin/materials/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.materials.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Material not found.' });
      return;
    }
    const [removed] = db.materials.splice(idx, 1);
    if (removed?.storedFileName) {
      const diskPath = path.join(UPLOADS_DIR, path.basename(removed.storedFileName));
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    }
    saveDb(db);
    res.json({ deleted: true });
  });

  // Admin Course Enquiries
  app.get('/api/admin/course-enquiries', requireAdmin, (_req, res) => {
    res.json(getDb().courseEnquiries);
  });

  app.put('/api/admin/course-enquiries/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.courseEnquiries.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Course enquiry not found.' });
      return;
    }
    const existing = db.courseEnquiries[idx];
    const nextStatus = req.body?.status;
    if (nextStatus && !VALID_ENQUIRY_STATUSES.includes(nextStatus)) {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }
    db.courseEnquiries[idx] = {
      ...existing,
      status: nextStatus || existing.status,
      internalNotes:
        req.body?.internalNotes !== undefined
          ? sanitizeString(req.body.internalNotes, 2000)
          : existing.internalNotes,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);
    res.json(db.courseEnquiries[idx]);
  });

  app.delete('/api/admin/course-enquiries/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.courseEnquiries.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Course enquiry not found.' });
      return;
    }
    db.courseEnquiries.splice(idx, 1);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Admin Project Enquiries
  app.get('/api/admin/project-enquiries', requireAdmin, (_req, res) => {
    res.json(getDb().projectEnquiries);
  });

  app.put('/api/admin/project-enquiries/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.projectEnquiries.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project enquiry not found.' });
      return;
    }
    const existing = db.projectEnquiries[idx];
    const nextStatus = req.body?.status;
    if (nextStatus && !VALID_ENQUIRY_STATUSES.includes(nextStatus)) {
      res.status(400).json({ error: 'Invalid status value.' });
      return;
    }
    db.projectEnquiries[idx] = {
      ...existing,
      status: nextStatus || existing.status,
      assignedTo:
        req.body?.assignedTo !== undefined
          ? sanitizeString(req.body.assignedTo, 120)
          : existing.assignedTo,
      internalNotes:
        req.body?.internalNotes !== undefined
          ? sanitizeString(req.body.internalNotes, 2000)
          : existing.internalNotes,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);
    res.json(db.projectEnquiries[idx]);
  });

  app.delete('/api/admin/project-enquiries/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.projectEnquiries.findIndex((e) => e.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project enquiry not found.' });
      return;
    }
    db.projectEnquiries.splice(idx, 1);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Admin Certificate Management
  app.get('/api/admin/certificates/next-id', requireAdmin, (_req, res) => {
    const nextCertificateId = getNextCertificateId(getDb().certificates);
    res.json({ nextCertificateId });
  });

  app.get('/api/admin/certificates', requireAdmin, (_req, res) => {
    const list = [...getDb().certificates].sort((a, b) => {
      if (a.isDemo && !b.isDemo) return 1;
      if (!a.isDemo && b.isDemo) return -1;
      return a.certificateId.localeCompare(b.certificateId, undefined, { numeric: true });
    });
    res.json(list);
  });

  app.post('/api/admin/certificates', requireAdmin, (req, res) => {
    const db = getDb();
    const studentName = sanitizeString(req.body?.studentName, 140);
    const studentEmail = sanitizeString(req.body?.studentEmail, 160);
    const courseName = sanitizeString(req.body?.courseName, 160);
    const completionDate = sanitizeString(req.body?.completionDate, 80);
    const verifiedCompletion = Boolean(req.body?.verifiedCompletion);

    if (!studentName || !courseName || !completionDate) {
      res.status(400).json({ error: 'Student name, course name, and completion date are required.' });
      return;
    }

    if (!verifiedCompletion) {
      res.status(400).json({
        error: 'Admin must confirm course completion verification before issuing a certificate.',
      });
      return;
    }

    let certificateId = sanitizeString(req.body?.certificateId, 60).toUpperCase();
    if (!certificateId) {
      certificateId = getNextCertificateId(db.certificates);
    }

    if (db.certificates.some((c) => c.certificateId.toUpperCase() === certificateId)) {
      res.status(409).json({ error: `Certificate ID "${certificateId}" already exists.` });
      return;
    }

    const record: CertificateRecord = {
      id: createId('cert'),
      certificateId,
      studentName,
      studentEmail,
      courseName,
      completionDate,
      issuedAt: new Date().toISOString(),
      isDemo: false,
      verifiedCompletion: true,
      status: 'Active',
      authorizedSignatory:
        sanitizeString(req.body?.authorizedSignatory, 120) || db.settings.authorizedSignatory,
    };

    db.certificates.push(record);
    saveDb(db);
    res.status(201).json(record);
  });

  app.put('/api/admin/certificates/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.certificates.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }
    const existing = db.certificates[idx];
    if (existing.isDemo) {
      res.status(400).json({ error: 'The Demo Sample certificate cannot be modified.' });
      return;
    }
    const status = req.body?.status === 'Revoked' ? 'Revoked' : 'Active';
    db.certificates[idx] = {
      ...existing,
      status,
    };
    saveDb(db);
    res.json(db.certificates[idx]);
  });

  app.delete('/api/admin/certificates/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.certificates.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }
    if (db.certificates[idx].isDemo) {
      res.status(400).json({ error: 'Cannot delete the official Demo Sample certificate.' });
      return;
    }
    db.certificates.splice(idx, 1);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Admin Contact Messages
  app.get('/api/admin/contact-messages', requireAdmin, (_req, res) => {
    res.json(getDb().contactMessages);
  });

  app.put('/api/admin/contact-messages/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.contactMessages.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }
    const existing = db.contactMessages[idx];
    const allowed: ContactMessage['status'][] = ['Unread', 'Read', 'Replied', 'Archived'];
    const nextStatus = allowed.includes(req.body?.status) ? req.body.status : existing.status;

    db.contactMessages[idx] = {
      ...existing,
      status: nextStatus,
      internalNotes:
        req.body?.internalNotes !== undefined
          ? sanitizeString(req.body.internalNotes, 2000)
          : existing.internalNotes,
      updatedAt: new Date().toISOString(),
    };
    saveDb(db);
    res.json(db.contactMessages[idx]);
  });

  app.delete('/api/admin/contact-messages/:id', requireAdmin, (req, res) => {
    const db = getDb();
    const idx = db.contactMessages.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }
    db.contactMessages.splice(idx, 1);
    saveDb(db);
    res.json({ deleted: true });
  });

  // Admin Website Content
  app.get('/api/admin/content', requireAdmin, (_req, res) => {
    res.json(getDb().content);
  });

  app.put('/api/admin/content', requireAdmin, (req, res) => {
    const db = getDb();
    const incoming = req.body || {};
    db.content = {
      ...db.content,
      companyName: sanitizeString(incoming.companyName, 120) || db.content.companyName,
      tagline: sanitizeString(incoming.tagline, 160) || db.content.tagline,
      slogan: sanitizeString(incoming.slogan, 200) || db.content.slogan,
      onlineBanner: sanitizeString(incoming.onlineBanner, 240) || db.content.onlineBanner,
      heroHeading: sanitizeString(incoming.heroHeading, 240) || db.content.heroHeading,
      heroDescription: sanitizeString(incoming.heroDescription, 1200) || db.content.heroDescription,
      companyIntro: sanitizeString(incoming.companyIntro, 1200) || db.content.companyIntro,
      aboutIntro: sanitizeString(incoming.aboutIntro, 1800) || db.content.aboutIntro,
      mission: sanitizeString(incoming.mission, 1200) || db.content.mission,
      vision: sanitizeString(incoming.vision, 1200) || db.content.vision,
      coreValues: Array.isArray(incoming.coreValues) ? incoming.coreValues : db.content.coreValues,
      whyChooseItems: Array.isArray(incoming.whyChooseItems)
        ? incoming.whyChooseItems
        : db.content.whyChooseItems,
    };
    saveDb(db);
    res.json(db.content);
  });

  // Admin Settings & Password
  app.get('/api/admin/settings', requireAdmin, (_req, res) => {
    res.json(getDb().settings);
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const db = getDb();
    const incoming = req.body || {};
    db.settings = {
      ...db.settings,
      whatsappNumber: sanitizeString(incoming.whatsappNumber, 40) || db.settings.whatsappNumber,
      whatsappUrl: sanitizeString(incoming.whatsappUrl, 200) || db.settings.whatsappUrl,
      email: sanitizeString(incoming.email, 160) || db.settings.email,
      websiteDomain: sanitizeString(incoming.websiteDomain, 160) || db.settings.websiteDomain,
      authorizedSignatory:
        sanitizeString(incoming.authorizedSignatory, 120) || db.settings.authorizedSignatory,
      teamMembers: Array.isArray(incoming.teamMembers)
        ? incoming.teamMembers.map((t: unknown) => sanitizeString(t, 120)).filter(Boolean)
        : db.settings.teamMembers,
    };
    saveDb(db);
    res.json(db.settings);
  });

  app.post('/api/admin/change-password', requireAdmin, (req, res) => {
    const db = getDb();
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!verifyPassword(currentPassword, db.admin.passwordSalt, db.admin.passwordHash)) {
      res.status(400).json({ error: 'Current password is incorrect.' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters.' });
      return;
    }

    const { salt, hash } = hashPassword(newPassword);
    db.admin.passwordSalt = salt;
    db.admin.passwordHash = hash;
    saveDb(db);
    res.json({ success: true });
  });

  // Always return JSON for unmatched /api/* endpoints
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Ensure API middleware/upload errors also return JSON instead of HTML
  app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status =
      typeof (err as { status?: number })?.status === 'number'
        ? (err as { status: number }).status
        : 500;
    const message = err instanceof Error ? err.message : 'Internal server error.';
    res.status(status).json({ error: message });
  });

  return app;
}
