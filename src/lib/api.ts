import type {
  AdminOverviewData,
  CertificateRecord,
  ContactMessage,
  Course,
  CourseEnquiry,
  CourseMaterial,
  EnquiryStatus,
  ProjectEnquiry,
  PublicBootstrapData,
  SiteSettings,
  WebsiteContent,
} from '../types';

const TOKEN_KEY = 'apj_admin_token';

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage restriction
  }
}

async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && url.startsWith('/api/admin')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  // Public
  getBootstrap: () => requestJson<PublicBootstrapData>('/api/public/bootstrap'),
  getCourses: () => requestJson<Course[]>('/api/courses'),
  getCourseBySlug: (slug: string) =>
    requestJson<{ course: Course; materials: CourseMaterial[] }>(`/api/courses/${encodeURIComponent(slug)}`),
  getMaterials: () => requestJson<CourseMaterial[]>('/api/materials'),
  verifyCertificate: (certificateId: string) =>
    requestJson<{
      verified: boolean;
      revoked?: boolean;
      message?: string;
      certificate?: CertificateRecord;
    }>(`/api/certificates/verify/${encodeURIComponent(certificateId.trim())}`),

  submitCourseEnquiry: (payload: {
    studentName: string;
    email: string;
    phone: string;
    college: string;
    selectedCourse: string;
    message: string;
  }) =>
    requestJson<{ success: boolean; enquiry: CourseEnquiry }>('/api/course-enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitProjectEnquiry: (payload: {
    studentName: string;
    email: string;
    whatsappNumber: string;
    collegeName: string;
    department: string;
    projectType: string;
    projectTitle: string;
    preferredTechnology: string;
    projectDescription: string;
    requiredSupport: string;
  }) =>
    requestJson<{ success: boolean; enquiry: ProjectEnquiry }>('/api/project-enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitContactMessage: (payload: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) =>
    requestJson<{ success: boolean; record: ContactMessage }>('/api/contact-messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Admin Auth
  adminLogin: async (email: string, password: string) => {
    const res = await requestJson<{
      authenticated: boolean;
      admin: { email: string };
      token?: string;
    }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) setAdminToken(res.token);
    return res;
  },

  adminLogout: async () => {
    try {
      await requestJson('/api/admin/logout', { method: 'POST' });
    } finally {
      setAdminToken(null);
    }
  },

  adminMe: () =>
    requestJson<{ authenticated: boolean; admin?: { email: string } }>('/api/admin/me'),

  // Admin Overview & Management
  getAdminOverview: () => requestJson<AdminOverviewData>('/api/admin/overview'),

  uploadFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return requestJson<{
      fileUrl: string;
      storedFileName: string;
      fileName: string;
      fileType: string;
      fileSizeLabel: string;
    }>('/api/admin/upload', {
      method: 'POST',
      body: form,
    });
  },

  // Courses
  getAdminCourses: () => requestJson<Course[]>('/api/admin/courses'),
  createCourse: (payload: Partial<Course>) =>
    requestJson<Course>('/api/admin/courses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCourse: (id: string, payload: Partial<Course>) =>
    requestJson<Course>(`/api/admin/courses/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCourse: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/admin/courses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Materials
  getAdminMaterials: () => requestJson<CourseMaterial[]>('/api/admin/materials'),
  createMaterial: (payload: Partial<CourseMaterial>) =>
    requestJson<CourseMaterial>('/api/admin/materials', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateMaterial: (id: string, payload: Partial<CourseMaterial>) =>
    requestJson<CourseMaterial>(`/api/admin/materials/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteMaterial: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/admin/materials/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Course Enquiries
  getCourseEnquiries: () => requestJson<CourseEnquiry[]>('/api/admin/course-enquiries'),
  updateCourseEnquiry: (
    id: string,
    payload: { status?: EnquiryStatus; internalNotes?: string }
  ) =>
    requestJson<CourseEnquiry>(`/api/admin/course-enquiries/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteCourseEnquiry: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/admin/course-enquiries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Project Enquiries
  getProjectEnquiries: () => requestJson<ProjectEnquiry[]>('/api/admin/project-enquiries'),
  updateProjectEnquiry: (
    id: string,
    payload: { status?: EnquiryStatus; assignedTo?: string; internalNotes?: string }
  ) =>
    requestJson<ProjectEnquiry>(`/api/admin/project-enquiries/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProjectEnquiry: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/admin/project-enquiries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Certificates
  getNextCertificateId: () =>
    requestJson<{ nextCertificateId: string }>('/api/admin/certificates/next-id'),
  getAdminCertificates: () => requestJson<CertificateRecord[]>('/api/admin/certificates'),
  issueCertificate: (payload: {
    studentName: string;
    studentEmail: string;
    courseName: string;
    completionDate: string;
    certificateId?: string;
    verifiedCompletion: boolean;
    authorizedSignatory?: string;
  }) =>
    requestJson<CertificateRecord>('/api/admin/certificates', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCertificateStatus: (id: string, status: 'Active' | 'Revoked') =>
    requestJson<CertificateRecord>(`/api/admin/certificates/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  deleteCertificate: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/admin/certificates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Contact Messages
  getContactMessages: () => requestJson<ContactMessage[]>('/api/admin/contact-messages'),
  updateContactMessage: (
    id: string,
    payload: { status?: ContactMessage['status']; internalNotes?: string }
  ) =>
    requestJson<ContactMessage>(`/api/admin/contact-messages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteContactMessage: (id: string) =>
    requestJson<{ deleted: boolean }>(`/api/admin/contact-messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Content & Settings
  getAdminContent: () => requestJson<WebsiteContent>('/api/admin/content'),
  updateAdminContent: (payload: WebsiteContent) =>
    requestJson<WebsiteContent>('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  getAdminSettings: () => requestJson<SiteSettings>('/api/admin/settings'),
  updateAdminSettings: (payload: SiteSettings) =>
    requestJson<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  changeAdminPassword: (currentPassword: string, newPassword: string) =>
    requestJson<{ success: boolean }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};
