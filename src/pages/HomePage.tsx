import { ArrowRight, BookOpen, Code2, Cpu, Database, Download, FileText, Globe, Layers, Mail, MessageCircle, ShieldCheck, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApjLogo } from '../components/ApjLogo';
import { CertificateView } from '../components/CertificateView';
import { CourseArtwork } from '../components/CourseArtwork';
import { useSite } from '../context/SiteContext';
import { resolveApiUrl } from '../lib/api';

const HOME_SERVICES = [
  {
    number: '01',
    title: 'Website Development',
    description: 'Responsive, high-speed company and portfolio websites delivered completely online.',
    icon: Globe,
  },
  {
    number: '02',
    title: 'Web Application Development',
    description: 'Full-stack dashboards, portals, and cloud-hosted business applications.',
    icon: Layers,
  },
  {
    number: '03',
    title: 'Software Development',
    description: 'Custom automation tools, desktop utilities, and backend APIs engineered remotely.',
    icon: Code2,
  },
  {
    number: '04',
    title: 'Database Solutions',
    description: 'Structured SQL schema design, MySQL tuning, and reliable data workflows.',
    icon: Database,
  },
  {
    number: '05',
    title: 'Technical Support',
    description: 'Remote debugging, deployment assistance, and continuous maintenance.',
    icon: Wrench,
  },
  {
    number: '06',
    title: 'Digital Solutions',
    description: 'Modernizing workflows with cloud forms, reporting tools, and digital integration.',
    icon: Cpu,
  },
];

export function HomePage() {
  const { content, settings, courses, materials, loading } = useSite();

  const demoCertificate = {
    certificateId: 'APJ-DEMO-001',
    studentName: 'Sample Student',
    courseName: 'Python + AI',
    completionDate: 'Sample Date',
    isDemo: true,
    authorizedSignatory: settings.authorizedSignatory,
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section className="bg-[#071426] text-white border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#E5AC32]">
                {content.onlineBanner}
              </p>

              <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.75rem)] font-bold tracking-tight text-white leading-[1.1] text-balance max-w-2xl">
                {content.heroHeading}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {content.heroDescription}
              </p>

              {/* Hero CTAs with clear Focal Anchor */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-white bg-[#102B50] hover:bg-[#173B6D] border border-white/15 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Project Enquiry</span>
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-slate-200 hover:text-white border border-white/15 hover:border-white/30 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Services</span>
                </Link>

                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-[#E5AC32] hover:text-[#F6C85F] border border-[#E5AC32]/40 hover:border-[#E5AC32] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp Contact</span>
                </a>
              </div>
            </div>

            {/* Right Brand & Curriculum Anchor Card */}
            <div className="lg:col-span-5 flex">
              <div className="w-full rounded-2xl bg-[#102B50]/65 border border-white/10 p-7 sm:p-8 flex flex-col justify-between">
                <div className="flex items-center gap-5">
                  <ApjLogo className="h-24 w-24 sm:h-28 sm:w-28" withFrame={true} />
                  <div>
                    <p className="font-display text-2xl font-bold text-white tracking-tight">
                      {content.companyName}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#E5AC32]">
                      {content.tagline}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{content.slogan}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Active Online Tracks
                  </p>
                  <div className="divide-y divide-white/10">
                    {courses.slice(0, 5).map((course) => (
                      <Link
                        key={course.id}
                        to={`/courses/${course.slug}`}
                        className="py-2.5 flex items-center justify-between gap-3 text-sm text-slate-200 hover:text-white group transition-colors"
                      >
                        <span className="font-medium truncate">{course.title}</span>
                        <span className="text-xs text-[#E5AC32] group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0">
                          View syllabus &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY INTRODUCTION & WHY CHOOSE APJ TECH */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
                About APJ Tech
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#071426] text-balance">
                Practical online education and engineering guidance built for real careers
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                {content.companyIntro}
              </p>
              <p className="mt-4 text-sm font-semibold text-[#102B50]">
                {content.onlineBanner}
              </p>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#258BFF] hover:text-[#102B50] transition-colors"
                >
                  <span>Read our Mission &amp; Vision</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(content.whyChooseItems.length > 0
                ? content.whyChooseItems
                : [
                    {
                      title: '100% Online Interactive Format',
                      description:
                        'Attend guided sessions, access structured digital notes, and collaborate remotely from anywhere.',
                    },
                    {
                      title: 'Hands-On Project Mentorship',
                      description:
                        'Dedicated support for mini projects, final-year engineering builds, code walkthroughs, and viva preparation.',
                    },
                    {
                      title: 'Structured Study Materials',
                      description:
                        'Download curated PDF notes, spreadsheet exercises, JavaScript code snippets, and SQL practice sets.',
                    },
                    {
                      title: 'Verified Completion Records',
                      description:
                        'Graduates earn an APJ Tech Course Completion Certificate backed by unique online ID verification.',
                    },
                  ]
              ).map((item, idx) => (
                <div
                  key={item.title}
                  className="p-6 rounded-xl bg-[#F4F7FC] border border-slate-200/90"
                >
                  <p className="font-mono text-xs font-semibold text-[#258BFF] tabular-nums">
                    0{idx + 1}.
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#071426]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR COURSES */}
      <section className="py-16 lg:py-20 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
                Online Courses
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#071426]">
                Structured tracks from fundamentals to real projects
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#102B50] hover:text-[#258BFF] whitespace-nowrap shrink-0"
            >
              <span>View all courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 rounded-xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-[#258BFF]/50 transition-colors"
                >
                  <CourseArtwork course={course} className="h-44 w-full" />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        {course.category} <span aria-hidden="true">·</span> {course.modules.length}{' '}
                        Modules <span aria-hidden="true">·</span> 100% Online
                      </p>
                      <h3 className="mt-2 font-display text-xl font-semibold text-[#071426]">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {course.shortDescription}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#258BFF] hover:text-[#102B50]"
                      >
                        <span>Explore syllabus</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/courses/${course.slug}#enquire`}
                        className="text-xs font-semibold text-[#071426] hover:text-[#258BFF] whitespace-nowrap"
                      >
                        Enquire Now
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ONLINE IT SERVICES */}
      <section className="py-16 lg:py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
                100% Online IT Services
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#071426]">
                Software, web engineering, and technical solutions delivered remotely
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#102B50] hover:text-[#258BFF] whitespace-nowrap shrink-0"
            >
              <span>All IT Services</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOME_SERVICES.map((srv) => {
              const Icon = srv.icon;
              return (
                <div
                  key={srv.number}
                  className="p-6 rounded-xl bg-[#F4F7FC] border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#258BFF] tabular-nums">
                        {srv.number}.
                      </span>
                      <Icon className="h-5 w-5 text-[#102B50]" aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold text-[#071426]">
                      {srv.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                  <p className="mt-5 text-xs font-medium text-slate-500">
                    Remote Delivery <span aria-hidden="true">·</span> Online Consultation
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* STUDENT PROJECT SUPPORT + COURSE MATERIALS PREVIEW */}
      <section className="py-16 lg:py-20 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Student Project Support Panel */}
          <div className="lg:col-span-6 rounded-2xl bg-[#071426] text-white p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#E5AC32]">
                Student Project Guidance
              </p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Guided Mini &amp; Final Year Projects from Concept to Viva
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
                Receive 100% online mentorship across Python, AI/ML, Web Development, Database
                Management, and IoT systems. We guide architecture, code implementation, debugging,
                and clear documentation.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-slate-200">
                <span>· Mini &amp; Final Year Projects</span>
                <span>· Python &amp; AI / ML</span>
                <span>· Full-Stack Web Apps</span>
                <span>· MySQL &amp; Database Builds</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#071426] bg-[#E5AC32] hover:bg-[#F3C152] rounded-lg transition-colors whitespace-nowrap"
              >
                <span>Submit Project Enquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Discuss on WhatsApp &rarr;
              </a>
            </div>
          </div>

          {/* Course Materials Preview Panel */}
          <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
                    Course Materials
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#071426]">
                    Downloadable Study Notes &amp; Practice Files
                  </h2>
                </div>
                <BookOpen className="h-6 w-6 text-[#102B50] shrink-0" />
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                {materials.slice(0, 5).map((mat) => (
                  <div key={mat.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#071426] truncate">
                        {mat.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {mat.courseCategory} <span aria-hidden="true">·</span> {mat.fileType}
                      </p>
                    </div>
                    <a
                      href={resolveApiUrl(mat.fileUrl)}
                      download={mat.fileName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#258BFF] hover:text-white bg-[#258BFF]/10 hover:bg-[#258BFF] rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>{materials.length} published study resources</span>
              </span>
              <Link
                to="/materials"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#102B50] hover:text-[#258BFF]"
              >
                <span>Browse all materials</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATE SAMPLE PREVIEW */}
      <section className="py-16 lg:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
                Completion Certificates
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#071426] text-balance">
                Verify course completion online with unique certificate IDs
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                Students who complete an APJ Tech online course receive a Landscape A4 Certificate of
                Completion issued by authorized administrators. Every issued certificate can be
                verified directly on our portal using its unique Certificate ID.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/certificates"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#071426] hover:bg-[#102B50] rounded-lg transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#E5AC32]" />
                  <span>Verify or Download Sample</span>
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                Shown beside: Official Demo Sample Certificate (ID: APJ-DEMO-001) displaying the
                SAMPLE watermark. APJ Tech issues internal course completion records and does not
                claim government accreditation.
              </p>
            </div>

            <div className="lg:col-span-7">
              <CertificateView certificate={demoCertificate} settings={settings} />
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CALLOUT */}
      <section className="py-14 bg-[#102B50] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#E5AC32]">
              {content.onlineBanner}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to start learning or building your next project?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Reach our online team directly via WhatsApp, email, or the enquiry form.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={settings.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#071426] bg-[#E5AC32] hover:bg-[#F4C558] rounded-lg transition-colors whitespace-nowrap"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="tabular-nums">WhatsApp {settings.whatsappNumber}</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors whitespace-nowrap"
            >
              <Mail className="h-4 w-4" />
              <span>{settings.email}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
