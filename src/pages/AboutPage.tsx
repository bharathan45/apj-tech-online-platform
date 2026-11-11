import { ArrowRight, Compass, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApjLogo } from '../components/ApjLogo';
import { useSite } from '../context/SiteContext';

export function AboutPage() {
  const { content, settings } = useSite();

  return (
    <div>
      {/* Header Banner */}
      <section className="bg-[#071426] text-white py-16 border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <p className="text-xs sm:text-sm font-semibold text-[#E5AC32]">
              {content.onlineBanner}
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
              About {content.companyName}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {content.aboutIntro}
            </p>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="bg-[#102B50] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
              <ApjLogo className="h-20 w-20" withFrame={true} />
              <div>
                <p className="font-display text-xl font-bold text-white">{content.companyName}</p>
                <p className="text-sm font-semibold text-[#E5AC32]">{content.tagline}</p>
                <p className="text-xs text-slate-300 mt-1">{content.slogan}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-xl bg-[#F4F7FC] border border-slate-200">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-[#071426] text-[#E5AC32]">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-[#071426]">Our Mission</h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">{content.mission}</p>
          </div>

          <div className="p-8 rounded-xl bg-[#F4F7FC] border border-slate-200">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-[#258BFF] text-white">
              <Compass className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold text-[#071426]">Our Vision</h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">{content.vision}</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#258BFF]">
              Core Values
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#071426]">
              Principles behind every course and project
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.coreValues.map((val, idx) => (
              <div key={val.title} className="p-7 rounded-xl bg-white border border-slate-200">
                <span className="font-mono text-xs font-semibold text-[#258BFF] tabular-nums">
                  0{idx + 1}.
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold text-[#071426]">
                  {val.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{val.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-2xl bg-[#071426] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold">
                Explore our 100% Online Training &amp; Mentorship Programs
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Connect with our online team at {settings.email} or WhatsApp {settings.whatsappNumber}.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors"
              >
                <span>Browse Courses</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#071426] bg-[#E5AC32] hover:bg-[#F3C152] rounded-lg transition-colors"
              >
                <span>Project Guidance</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
