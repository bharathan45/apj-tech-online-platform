import { useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Mail, Menu, MessageCircle, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { ApjLogo } from './ApjLogo';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About', end: false },
  { to: '/services', label: 'Services', end: false },
  { to: '/projects', label: 'Projects', end: false },
  { to: '/courses', label: 'Courses', end: false },
  { to: '/materials', label: 'Materials', end: false },
  { to: '/certificates', label: 'Certificates', end: false },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const { content, settings } = useSite();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC] text-[#071426]">
      {/* Strict 3-Zone Single-Row Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Lockup */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258BFF] rounded-lg"
          >
            <ApjLogo className="h-10 w-10" withFrame={false} />
            <span className="font-display text-lg font-bold tracking-tight text-[#071426]">
              {content.companyName || 'APJ Tech'}
            </span>
          </Link>

          {/* Zone 2: Clean Single-Line Text Navigation */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258BFF] rounded ${
                    isActive
                      ? 'text-[#258BFF]'
                      : 'text-slate-600 hover:text-[#071426]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#258BFF] rounded-full"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#258BFF] focus-visible:ring-offset-2"
            >
              Contact Us
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-lg border border-slate-200 text-[#071426] hover:bg-slate-50 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#258BFF]/10 text-[#258BFF]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/contact"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#258BFF] rounded-lg"
              >
                Contact Us
              </Link>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-[#071426] border border-slate-200 rounded-lg"
              >
                WhatsApp: {settings.whatsappNumber}
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Quiet Deep Navy Footer */}
      <footer className="bg-[#071426] text-slate-300 border-t border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ApjLogo className="h-12 w-12" withFrame={true} />
                <div>
                  <p className="font-display text-lg font-bold text-white leading-tight">
                    {content.companyName}
                  </p>
                  <p className="text-xs font-medium text-[#E5AC32]">{content.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{content.slogan}</p>
              <p className="text-xs font-medium text-[#E5AC32] leading-relaxed">
                {content.onlineBanner}
              </p>
            </div>

            {/* Navigation Column */}
            <div>
              <h3 className="font-display text-sm font-semibold text-white mb-4">Explore</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:text-white transition-colors">
                    IT Services
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="hover:text-white transition-colors">
                    Student Projects
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="hover:text-white transition-colors">
                    Online Courses
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-display text-sm font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/materials" className="hover:text-white transition-colors">
                    Course Materials
                  </Link>
                </li>
                <li>
                  <Link to="/certificates" className="hover:text-white transition-colors">
                    Certificates &amp; Verification
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-slate-400 hover:text-[#E5AC32] transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="font-display text-sm font-semibold text-white mb-4">
                Online Support Desk
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-slate-200 hover:text-[#E5AC32] transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-[#E5AC32] shrink-0" />
                  <span className="tabular-nums">{settings.whatsappNumber}</span>
                </a>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2.5 text-slate-200 hover:text-[#E5AC32] transition-colors break-all"
                >
                  <Mail className="h-4 w-4 text-[#258BFF] shrink-0" />
                  <span>{settings.email}</span>
                </a>
                <p className="text-xs text-slate-400 pt-1">
                  All training, project mentorship, and software services are delivered 100% online.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#102B50] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} {content.companyName}. {content.tagline}{' '}
              {content.slogan}
            </p>
            <p>100% Online Services</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
