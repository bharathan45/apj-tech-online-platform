import { useCallback, useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ApjLogo } from '../../components/ApjLogo';
import { api } from '../../lib/api';
import type { AdminOverviewData } from '../../types';
import { CertificatesSection } from './sections/CertificatesSection';
import { ContentSection } from './sections/ContentSection';
import { CourseEnquiriesSection } from './sections/CourseEnquiriesSection';
import { CoursesSection } from './sections/CoursesSection';
import { MaterialsSection } from './sections/MaterialsSection';
import { MessagesSection } from './sections/MessagesSection';
import { OverviewSection } from './sections/OverviewSection';
import { ProjectEnquiriesSection } from './sections/ProjectEnquiriesSection';
import { SettingsSection } from './sections/SettingsSection';

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'Manage Courses', icon: BookOpen },
  { id: 'materials', label: 'Manage Course Materials', icon: FileText },
  { id: 'course-enquiries', label: 'Course Enquiries', icon: Inbox },
  { id: 'project-enquiries', label: 'Project Enquiries', icon: FolderKanban },
  { id: 'certificates', label: 'Certificate Management', icon: Award },
  { id: 'messages', label: 'Contact Messages', icon: Mail },
  { id: 'content', label: 'Website Content', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const data = await api.getAdminOverview();
      setOverview(data);
    } catch {
      // ignore if session expired
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api
      .adminMe()
      .then((res) => {
        if (!active) return;
        if (!res.authenticated) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setAdminEmail(res.admin?.email || '');
        setAuthChecking(false);
        loadOverview();
      })
      .catch(() => {
        if (active) navigate('/admin/login', { replace: true });
      });

    return () => {
      active = false;
    };
  }, [navigate, loadOverview]);

  async function handleLogout() {
    await api.adminLogout();
    navigate('/admin/login', { replace: true });
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#071426] flex items-center justify-center text-sm text-slate-300">
        Verifying admin session...
      </div>
    );
  }

  const currentTitle =
    SIDEBAR_ITEMS.find((i) => i.id === activeTab)?.label || 'Dashboard Overview';

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex">
      {/* Dark Navy Sidebar (Desktop Fixed + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 bg-[#071426] text-white flex flex-col justify-between border-r border-[#102B50] transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="px-5 py-5 border-b border-[#102B50] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <ApjLogo className="h-10 w-10" withFrame={true} />
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-white truncate">APJ Tech</p>
                <p className="text-[11px] font-medium text-[#E5AC32] truncate">
                  Admin Dashboard
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-3 space-y-1" aria-label="Admin Sidebar">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#258BFF] text-white'
                      : 'text-slate-300 hover:text-white hover:bg-[#102B50]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 10. Logout + Signed In Info */}
        <div className="p-3 border-t border-[#102B50] space-y-2">
          <div className="px-3.5 py-2 text-[11px] text-slate-400 truncate">
            Signed in as <span className="text-slate-200 font-medium">{adminEmail}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:text-white hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg border border-slate-200 flex items-center justify-center text-[#071426] cursor-pointer"
              aria-label="Open admin sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-slate-400 hidden sm:inline">APJ Tech Admin</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="font-display font-semibold text-[#071426] truncate">
                {currentTitle}
              </span>
            </div>
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#071426] bg-[#F4F7FC] hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Live Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </header>

        {/* Active Viewport */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewSection
              overview={overview}
              loading={overviewLoading}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'courses' && <CoursesSection onStatsChanged={loadOverview} />}
          {activeTab === 'materials' && <MaterialsSection onStatsChanged={loadOverview} />}
          {activeTab === 'course-enquiries' && (
            <CourseEnquiriesSection onStatsChanged={loadOverview} />
          )}
          {activeTab === 'project-enquiries' && (
            <ProjectEnquiriesSection onStatsChanged={loadOverview} />
          )}
          {activeTab === 'certificates' && (
            <CertificatesSection onStatsChanged={loadOverview} />
          )}
          {activeTab === 'messages' && <MessagesSection onStatsChanged={loadOverview} />}
          {activeTab === 'content' && <ContentSection />}
          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  );
}
