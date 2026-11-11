import { ArrowRight, Code2, Cpu, Database, Globe, Layers, MessageCircle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

const SERVICES = [
  {
    number: '01',
    title: 'Website Development',
    icon: Globe,
    summary:
      'Custom-built responsive websites for startups, educators, portfolios, and businesses—designed, built, and launched completely online.',
    deliverables: [
      'Mobile-first responsive layout across desktop, tablet, and phone',
      'Clean semantic markup, fast loading, and clear SEO structure',
      'Online contact forms, WhatsApp integration, and hosting guidance',
    ],
  },
  {
    number: '02',
    title: 'Web Application Development',
    icon: Layers,
    summary:
      'Interactive full-stack web portals, management dashboards, and workflow applications tailored for remote teams and educational institutions.',
    deliverables: [
      'React & TypeScript client architectures with role-based views',
      'REST API backends with validated data persistence',
      '100% online requirements discovery, sprint demos, and deployment',
    ],
  },
  {
    number: '03',
    title: 'Software Development',
    icon: Code2,
    summary:
      'Reliable Python and JavaScript software utilities, automated reporting scripts, and custom application logic developed remotely.',
    deliverables: [
      'Modular, maintainable codebase with clean documentation',
      'Automated data processing, PDF generation, and API connectors',
      'Remote testing sessions and handover walkthroughs',
    ],
  },
  {
    number: '04',
    title: 'Database Solutions',
    icon: Database,
    summary:
      'Structured SQL & MySQL schema design, query optimization, data migration, and relational modeling delivered via online collaboration.',
    deliverables: [
      'Normalized ER schema design and referential integrity constraints',
      'Complex reporting queries, views, and index tuning',
      'Safe backup structures and query documentation',
    ],
  },
  {
    number: '05',
    title: 'Technical Support',
    icon: Wrench,
    summary:
      'Dedicated remote technical troubleshooting, bug resolution, code debugging, and cloud deployment support from anywhere.',
    deliverables: [
      'Online screen-share debugging and root-cause diagnostics',
      'Environment configuration, dependency fixes, and build verification',
      'Ongoing application updates and reliability monitoring',
    ],
  },
  {
    number: '06',
    title: 'Digital Solutions',
    icon: Cpu,
    summary:
      'Practical digital transformation services connecting forms, analytics spreadsheets, automated notifications, and online portals.',
    deliverables: [
      'Replacing manual paperwork with structured web workflows',
      'Data cleaning, dashboard reporting, and spreadsheet automation',
      'Tailored online training for team adoption',
    ],
  },
];

export function ServicesPage() {
  const { content, settings } = useSite();

  return (
    <div>
      <section className="bg-[#071426] text-white py-16 border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm font-semibold text-[#E5AC32]">
            {content.onlineBanner}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance max-w-3xl">
            100% Online IT Services &amp; Digital Engineering
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Every engineering, web development, database, and technical support service from APJ
            Tech is executed 100% online—allowing seamless collaboration from anywhere.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.number}
                className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs font-semibold text-[#258BFF] tabular-nums">
                      {service.number}. Online Service
                    </span>
                    <div className="h-10 w-10 rounded-lg bg-[#F4F7FC] border border-slate-200 flex items-center justify-center text-[#102B50]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h2 className="mt-4 font-display text-2xl font-bold text-[#071426]">
                    {service.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                    {service.summary}
                  </p>

                  <ul className="mt-6 space-y-2.5 text-sm text-slate-700 border-t border-slate-100 pt-5">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#258BFF] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#258BFF] hover:text-[#102B50]"
                  >
                    <span>Request Online Consultation</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href={`${settings.whatsappUrl}?text=${encodeURIComponent(
                      `Hello APJ Tech, I would like to enquire about ${service.title} (Online Service).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#071426] hover:text-[#258BFF]"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#E5AC32]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
