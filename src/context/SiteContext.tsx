import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { Course, CourseMaterial, SiteSettings, WebsiteContent } from '../types';

interface SiteContextValue {
  loading: boolean;
  error: string | null;
  content: WebsiteContent;
  settings: SiteSettings;
  courses: Course[];
  materials: CourseMaterial[];
  refreshPublicData: () => Promise<void>;
}

const DEFAULT_CONTENT: WebsiteContent = {
  companyName: 'APJ Tech',
  tagline: 'Build & Inspire.',
  slogan: 'Turning Ideas into Technology.',
  onlineBanner: '100% ONLINE SERVICES – Learn, Build and Grow from Anywhere.',
  heroHeading: 'Build Your Future with Technology',
  heroDescription:
    'APJ Tech provides online IT training, student project guidance and digital technology solutions. Learn new skills, develop practical knowledge and achieve your goals from anywhere.',
  companyIntro:
    'APJ Tech is an online technology education and digital engineering studio dedicated to helping students, graduates, and growing teams turn ideas into working software.',
  aboutIntro:
    'Founded with the spirit of Build & Inspire, APJ Tech delivers live online IT training, structured student project mentorship, and custom digital services without geographic barriers.',
  mission:
    'To provide accessible, hands-on online IT education and reliable student project guidance that bridges academic theory and real-world software engineering.',
  vision:
    'To become a trusted online learning and digital engineering partner where aspiring developers build practical capabilities and organizations deploy dependable technology.',
  coreValues: [],
  whyChooseItems: [],
};

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: '+91 8668130425',
  whatsappUrl: 'https://wa.me/918668130425',
  email: 'bharathan45k@gmail.com',
  websiteDomain: 'www.apjtech.in',
  authorizedSignatory: 'Authorized Signature',
  teamMembers: [],
};

const SiteContext = createContext<SiteContextValue>({
  loading: true,
  error: null,
  content: DEFAULT_CONTENT,
  settings: DEFAULT_SETTINGS,
  courses: [],
  materials: [],
  refreshPublicData: async () => {},
});

export function SiteProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<WebsiteContent>(DEFAULT_CONTENT);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);

  const refreshPublicData = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getBootstrap();
      setContent(data.content);
      setSettings(data.settings);
      setCourses(data.courses);
      setMaterials(data.materials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load website content.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPublicData();
  }, [refreshPublicData]);

  return (
    <SiteContext.Provider
      value={{ loading, error, content, settings, courses, materials, refreshPublicData }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite(): SiteContextValue {
  return useContext(SiteContext);
}
