import { useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api } from '../lib/api';
import type { ProjectType } from '../types';

const PROJECT_TYPES: ProjectType[] = [
  'Mini Project',
  'Final Year Project',
  'Python Project',
  'AI / ML Project',
  'Web Development Project',
  'Database Project',
  'IoT Project',
  'Other',
];

const SUPPORT_OPTIONS = [
  'Full Project Guidance & Implementation',
  'Architecture & Code Debugging',
  'UI / Backend Integration Support',
  'Documentation, Report & Viva Preparation',
  'Complete End-to-End Online Mentorship',
];

export function ProjectsPage() {
  const { content, settings } = useSite();

  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Final Year Project');
  const [projectTitle, setProjectTitle] = useState('');
  const [preferredTechnology, setPreferredTechnology] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [requiredSupport, setRequiredSupport] = useState(SUPPORT_OPTIONS[0]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.submitProjectEnquiry({
        studentName,
        email,
        whatsappNumber,
        collegeName,
        department,
        projectType,
        projectTitle,
        preferredTechnology,
        projectDescription,
        requiredSupport,
      });
      setSubmittedId(res.enquiry.id);
      setStudentName('');
      setEmail('');
      setWhatsappNumber('');
      setCollegeName('');
      setDepartment('');
      setProjectTitle('');
      setPreferredTechnology('');
      setProjectDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <section className="bg-[#071426] text-white py-16 border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm font-semibold text-[#E5AC32]">
            {content.onlineBanner}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance max-w-3xl">
            Student Project Guidance &amp; Mentorship
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Get structured 100% online mentorship for Mini Projects, Final Year Engineering Builds,
            Python, AI / ML, Web Development, Database, and IoT projects.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Guidance Steps Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-7">
              <h2 className="font-display text-xl font-bold text-[#071426]">
                How Online Project Guidance Works
              </h2>
              <div className="mt-5 space-y-5 text-sm">
                <div>
                  <p className="font-mono text-xs font-semibold text-[#258BFF]">01. Submit Scope</p>
                  <p className="mt-1 text-slate-600">
                    Share your department, preferred tech stack, and project idea in the enquiry form.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold text-[#258BFF]">02. Mentor Assignment</p>
                  <p className="mt-1 text-slate-600">
                    Our technical team reviews your submission and assigns a specialized online mentor.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-xs font-semibold text-[#258BFF]">03. Build &amp; Walkthrough</p>
                  <p className="mt-1 text-slate-600">
                    Learn how each module works through online code reviews, testing, and viva preparation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#102B50] text-white rounded-xl p-7">
              <h3 className="font-display text-lg font-semibold">Need quick project advice?</h3>
              <p className="mt-2 text-sm text-slate-300">
                Discuss your project abstract or topic directly with our online desk on WhatsApp.
              </p>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#071426] bg-[#E5AC32] hover:bg-[#F3C152] rounded-lg transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="tabular-nums">{settings.whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Project Enquiry Form */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-7 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-[#071426]">
              Project Enquiry Form
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Complete the details below. Your submission is recorded immediately for mentor review.
            </p>

            {submittedId && (
              <div className="mt-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Project enquiry submitted successfully
                  </p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Reference ID: <span className="font-mono font-semibold">{submittedId}</span>.
                    Our online project mentor will contact you via WhatsApp or email shortly.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 9XXXXXXXXX"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  College Name *
                </label>
                <input
                  type="text"
                  required
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Institution or University"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., CSE, IT, AI&DS, ECE, BCA, MCA"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Project Type *
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Proposed title or topic of your project"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Preferred Technology
                </label>
                <input
                  type="text"
                  value={preferredTechnology}
                  onChange={(e) => setPreferredTechnology(e.target.value)}
                  placeholder="e.g., Python, React, MySQL, TensorFlow"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Required Support *
                </label>
                <select
                  value={requiredSupport}
                  onChange={(e) => setRequiredSupport(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                >
                  {SUPPORT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Project Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your objectives, key features, dataset/hardware notes, or timeline goals..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting Project Enquiry...' : 'Submit Project Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
