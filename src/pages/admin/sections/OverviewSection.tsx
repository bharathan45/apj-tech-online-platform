import { Award, BookOpen, FileText, FolderKanban, Inbox, Mail } from 'lucide-react';
import type { AdminOverviewData } from '../../../types';

interface OverviewSectionProps {
  overview: AdminOverviewData | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
}

export function OverviewSection({ overview, loading, onNavigateTab }: OverviewSectionProps) {
  if (loading || !overview) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-28 rounded-xl bg-white border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Course Enquiries',
      value: overview.stats.totalCourseEnquiries,
      sub: 'Live database records',
      icon: Inbox,
      tab: 'course-enquiries',
    },
    {
      label: 'Total Project Enquiries',
      value: overview.stats.totalProjectEnquiries,
      sub: 'Student project requests',
      icon: FolderKanban,
      tab: 'project-enquiries',
    },
    {
      label: 'Total Courses',
      value: overview.stats.totalCourses,
      sub: `${overview.stats.publishedCourses} published publicly`,
      icon: BookOpen,
      tab: 'courses',
    },
    {
      label: 'Total Course Materials',
      value: overview.stats.totalMaterials,
      sub: `${overview.stats.publishedMaterials} published files`,
      icon: FileText,
      tab: 'materials',
    },
    {
      label: 'Total Certificates Issued',
      value: overview.stats.totalCertificatesIssued,
      sub: 'Verified real completions',
      icon: Award,
      tab: 'certificates',
    },
    {
      label: 'Total Contact Messages',
      value: overview.stats.totalContactMessages,
      sub: 'Public contact submissions',
      icon: Mail,
      tab: 'messages',
    },
  ];

  const statuses = Object.entries(overview.enquiryStatusBreakdown);

  return (
    <div className="space-y-8">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => onNavigateTab(card.tab)}
              className="text-left bg-white rounded-xl border border-slate-200 p-6 hover:border-[#258BFF]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <Icon className="h-4 w-4 text-[#258BFF] shrink-0" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[#071426] tabular-nums">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Enquiry Status Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="font-display text-lg font-bold text-[#071426]">
              Enquiry Status Overview
            </h2>
            <p className="text-xs text-slate-500">
              Combined live status counts across Course Enquiries &amp; Project Enquiries
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-4">
          {statuses.map(([status, count]) => (
            <div
              key={status}
              className="p-4 rounded-lg bg-[#F4F7FC] border border-slate-200/80"
            >
              <p className="text-xs font-medium text-slate-600">{status}</p>
              <p className="mt-1 font-display text-2xl font-bold text-[#071426] tabular-nums">
                {count}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Course Enquiries */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-display text-base font-bold text-[#071426]">
              Recent Course Enquiries
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('course-enquiries')}
              className="text-xs font-semibold text-[#258BFF] hover:underline cursor-pointer"
            >
              Manage all &rarr;
            </button>
          </div>

          {overview.recentCourseEnquiries.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              No course enquiries recorded yet. Submissions from course pages appear here in real time.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {overview.recentCourseEnquiries.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071426] truncate">
                      {item.studentName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.selectedCourse} · {item.college}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#102B50] shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Project Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-display text-base font-bold text-[#071426]">
              Recent Project Requests
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('project-enquiries')}
              className="text-xs font-semibold text-[#258BFF] hover:underline cursor-pointer"
            >
              Manage all &rarr;
            </button>
          </div>

          {overview.recentProjectEnquiries.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              No student project requests recorded yet. Submissions from Student Projects appear here.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {overview.recentProjectEnquiries.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071426] truncate">
                      {item.projectTitle}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.studentName} · {item.projectType}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#102B50] shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Certificates & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-display text-base font-bold text-[#071426]">
              Recent Issued Certificates
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('certificates')}
              className="text-xs font-semibold text-[#258BFF] hover:underline cursor-pointer"
            >
              Issue / Manage &rarr;
            </button>
          </div>

          {overview.recentCertificates.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              No real certificates issued yet. Only APJ-DEMO-001 sample certificate is currently active.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {overview.recentCertificates.map((cert) => (
                <div key={cert.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071426] truncate">
                      {cert.studentName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {cert.courseName} · {cert.completionDate}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#258BFF] tabular-nums shrink-0">
                    {cert.certificateId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-display text-base font-bold text-[#071426]">
              Recent Contact Messages
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-semibold text-[#258BFF] hover:underline cursor-pointer"
            >
              Open Inbox &rarr;
            </button>
          </div>

          {overview.recentMessages.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              No contact messages received yet.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {overview.recentMessages.map((msg) => (
                <div key={msg.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#071426] truncate">
                      {msg.subject}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {msg.name} · {msg.email}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#102B50] shrink-0">
                    {msg.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
