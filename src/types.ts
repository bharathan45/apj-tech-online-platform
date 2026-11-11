export type EnquiryStatus = 'New' | 'Contacted' | 'In Progress' | 'Completed' | 'Rejected';

export type ProjectType =
  | 'Mini Project'
  | 'Final Year Project'
  | 'Python Project'
  | 'AI / ML Project'
  | 'Web Development Project'
  | 'Database Project'
  | 'IoT Project'
  | 'Other';

export type ContactStatus = 'Unread' | 'Read' | 'Replied' | 'Archived';

export interface CourseModule {
  id: string;
  title: string;
  topics: string[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  published: boolean;
  syllabusOverview: string;
  modules: CourseModule[];
  learningOutcomes: string[];
  sampleLessonTitle: string;
  sampleLessonContent: string;
  sampleLessonCode: string;
  practiceExercises: string[];
  sampleProjectTitle: string;
  sampleProjectDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  courseCategory: string;
  fileType: string;
  fileName: string;
  fileUrl: string;
  storedFileName: string;
  fileSizeLabel: string;
  previewContent: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnquiry {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  college: string;
  selectedCourse: string;
  message: string;
  enquiryDate: string;
  status: EnquiryStatus;
  internalNotes: string;
  updatedAt: string;
}

export interface ProjectEnquiry {
  id: string;
  studentName: string;
  email: string;
  whatsappNumber: string;
  collegeName: string;
  department: string;
  projectType: ProjectType;
  projectTitle: string;
  preferredTechnology: string;
  projectDescription: string;
  requiredSupport: string;
  enquiryDate: string;
  status: EnquiryStatus;
  assignedTo: string;
  internalNotes: string;
  updatedAt: string;
}

export interface CertificateRecord {
  id: string;
  certificateId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  completionDate: string;
  issuedAt: string;
  isDemo: boolean;
  verifiedCompletion: boolean;
  status: 'Active' | 'Revoked';
  authorizedSignatory: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: ContactStatus;
  internalNotes: string;
  updatedAt: string;
}

export interface CoreValueItem {
  title: string;
  description: string;
}

export interface WebsiteContent {
  companyName: string;
  tagline: string;
  slogan: string;
  onlineBanner: string;
  heroHeading: string;
  heroDescription: string;
  companyIntro: string;
  aboutIntro: string;
  mission: string;
  vision: string;
  coreValues: CoreValueItem[];
  whyChooseItems: CoreValueItem[];
}

export interface SiteSettings {
  whatsappNumber: string;
  whatsappUrl: string;
  email: string;
  websiteDomain: string;
  authorizedSignatory: string;
  teamMembers: string[];
}

export interface PublicBootstrapData {
  content: WebsiteContent;
  settings: SiteSettings;
  courses: Course[];
  materials: CourseMaterial[];
}

export interface AdminOverviewData {
  stats: {
    totalCourseEnquiries: number;
    totalProjectEnquiries: number;
    totalCourses: number;
    publishedCourses: number;
    totalMaterials: number;
    publishedMaterials: number;
    totalCertificatesIssued: number;
    totalContactMessages: number;
  };
  enquiryStatusBreakdown: Record<EnquiryStatus, number>;
  recentCourseEnquiries: CourseEnquiry[];
  recentProjectEnquiries: ProjectEnquiry[];
  recentCertificates: CertificateRecord[];
  recentMessages: ContactMessage[];
}
