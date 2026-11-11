import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Download,
  FolderGit2,
  ListChecks,
  MessageCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CourseArtwork } from '../components/CourseArtwork';
import { useSite } from '../context/SiteContext';
import { api, resolveApiUrl } from '../lib/api';
import type { Course, CourseMaterial } from '../types';

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { content, settings } = useSite();

  const [course, setCourse] = useState<Course | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  // Course Enquiry Form
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.getCourseBySlug(slug);
        if (!active) return;
        setCourse(res.course);
        setMaterials(res.materials);
        setOpenModuleId(res.course.modules[0]?.id || null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load course.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [slug]);

  async function handleEnquirySubmit(e: FormEvent) {
    e.preventDefault();
    if (!course) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await api.submitCourseEnquiry({
        studentName,
        email,
        phone,
        college,
        selectedCourse: course.title,
        message,
      });
      setSubmittedRef(res.enquiry.id);
      setStudentName('');
      setEmail('');
      setPhone('');
      setCollege('');
      setMessage('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-[#071426]">Course not found</h1>
        <p className="mt-2 text-sm text-slate-600">{error || 'This course may be unpublished.'}</p>
        <Link
          to="/courses"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#258BFF] rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Header */}
      <section className="bg-[#071426] text-white py-14 border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Online Courses</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs sm:text-sm font-semibold text-[#E5AC32]">
                {content.onlineBanner}
              </p>
              <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight">
                {course.title}
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                {course.category} <span aria-hidden="true">·</span> {course.modules.length} Modules{' '}
                <span aria-hidden="true">·</span> Live Online Guidance
              </p>
              <p className="mt-4 text-base text-slate-200 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <a
                  href="#enquire"
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors"
                >
                  Enquire Now
                </a>
                <a
                  href={`${settings.whatsappUrl}?text=${encodeURIComponent(
                    `Hello APJ Tech, I would like to enquire about the ${course.title} online course.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#E5AC32] border border-[#E5AC32]/40 hover:border-[#E5AC32] rounded-lg transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border border-white/10">
                <CourseArtwork course={course} className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Course Content */}
      <section className="py-14 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Curriculum & Study Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Syllabus & Module-wise Topics */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 sm:p-8">
              <div className="flex items-center gap-2.5 text-[#258BFF] text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="h-4 w-4" />
                <span>Detailed Syllabus</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#071426]">
                Module-wise Curriculum
              </h2>
              <p className="mt-2 text-sm text-slate-600">{course.syllabusOverview}</p>

              <div className="mt-6 space-y-3">
                {course.modules.map((mod) => {
                  const isOpen = openModuleId === mod.id;
                  return (
                    <div
                      key={mod.id}
                      className="rounded-lg border border-slate-200 bg-[#F4F7FC]/60 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-display text-base font-semibold text-[#071426] hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span>{mod.title}</span>
                        {isOpen ? (
                          <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <ul className="px-5 pb-4 pt-1 space-y-2 border-t border-slate-200/70 bg-white">
                          {mod.topics.map((topic) => (
                            <li
                              key={topic}
                              className="flex items-start gap-2.5 text-sm text-slate-700 py-1"
                            >
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#258BFF] shrink-0" />
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 sm:p-8">
              <div className="flex items-center gap-2.5 text-[#258BFF] text-xs font-semibold uppercase tracking-wider">
                <ListChecks className="h-4 w-4" />
                <span>Learning Outcomes</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#071426]">
                What You Will Be Able to Build
              </h2>
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {course.learningOutcomes.map((outcome) => (
                  <li
                    key={outcome}
                    className="p-4 rounded-lg bg-[#F4F7FC] border border-slate-200/80 text-sm text-slate-700 leading-relaxed flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#258BFF] mt-0.5 shrink-0" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Lesson */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 sm:p-8">
              <div className="flex items-center gap-2.5 text-[#258BFF] text-xs font-semibold uppercase tracking-wider">
                <Code2 className="h-4 w-4" />
                <span>Sample Lesson</span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#071426]">
                {course.sampleLessonTitle}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                {course.sampleLessonContent}
              </p>

              {course.sampleLessonCode && (
                <pre className="mt-5 p-5 rounded-xl bg-[#071426] text-slate-100 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed">
                  <code>{course.sampleLessonCode}</code>
                </pre>
              )}
            </div>

            {/* Practice Exercises & Sample Project */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-7">
                <h3 className="font-display text-xl font-bold text-[#071426]">
                  Practice Exercises
                </h3>
                <ol className="mt-4 space-y-3 text-sm text-slate-700">
                  {course.practiceExercises.map((ex, idx) => (
                    <li key={ex} className="flex items-start gap-2.5">
                      <span className="font-mono text-xs font-semibold text-[#258BFF] mt-0.5 tabular-nums">
                        0{idx + 1}.
                      </span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-[#071426] text-white rounded-xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E5AC32]">
                    <FolderGit2 className="h-4 w-4" />
                    <span>Sample Capstone Project</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold">
                    {course.sampleProjectTitle}
                  </h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {course.sampleProjectDescription}
                  </p>
                </div>
                <Link
                  to="/projects"
                  className="mt-6 inline-flex text-xs font-semibold text-[#E5AC32] hover:underline"
                >
                  Need custom student project guidance? &rarr;
                </Link>
              </div>
            </div>

            {/* Course Materials */}
            <div className="bg-white rounded-xl border border-slate-200 p-7 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#071426]">
                    Included Course Materials
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Download notes and practice files published for {course.title}.
                  </p>
                </div>
                <Link
                  to="/materials"
                  className="text-sm font-semibold text-[#258BFF] hover:text-[#102B50] whitespace-nowrap"
                >
                  All Materials &rarr;
                </Link>
              </div>

              {materials.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">
                  Study notes for this track are accessible in the Course Materials library.
                </p>
              ) : (
                <div className="mt-5 divide-y divide-slate-100">
                  {materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#071426]">{mat.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{mat.description}</p>
                      </div>
                      <a
                        href={resolveApiUrl(mat.fileUrl)}
                        download={mat.fileName}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#071426] hover:bg-[#102B50] rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <Download className="h-3.5 w-3.5 text-[#E5AC32]" />
                        <span>Download {mat.fileType}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sticky Course Enquiry Form */}
          <aside id="enquire" className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7">
              <p className="text-xs font-semibold text-[#258BFF] uppercase tracking-wider">
                Online Registration
              </p>
              <h2 className="mt-1 font-display text-xl font-bold text-[#071426]">
                Enquire for {course.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                100% Online Training — Submit your details to get syllabus guidance and batch info.
              </p>

              {submittedRef && (
                <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <p className="font-semibold">Enquiry received! Ref: {submittedRef}</p>
                  <p className="mt-1">Our online coordinator will contact you soon.</p>
                </div>
              )}

              {submitError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleEnquirySubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Email *
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
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    College / Organization
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#071426] mb-1">
                    Questions or Learning Goals
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Preferred learning schedule or goals..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Enquire Now'}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
