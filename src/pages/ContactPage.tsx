import { useState, type FormEvent } from 'react';
import { CheckCircle2, Globe, Mail, MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { api } from '../lib/api';

export function ContactPage() {
  const { content, settings } = useSite();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.submitContactMessage({
        name,
        email,
        phone,
        subject,
        message,
      });
      setSubmittedId(res.record.id);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
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
            Contact APJ Tech Online
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Have questions about online IT courses, student project mentorship, or digital software
            services? Message us directly or send a note below.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Contact Channels */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 p-7">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#071426] text-[#E5AC32] flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    WhatsApp Support
                  </p>
                  <p className="font-display text-lg font-bold text-[#071426] tabular-nums">
                    {settings.whatsappNumber}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Fastest way to discuss course details, student projects, or service requirements.
              </p>
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#071426] bg-[#E5AC32] hover:bg-[#F3C152] rounded-lg transition-colors"
              >
                <span>Open WhatsApp Chat</span>
              </a>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-7">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#258BFF]/10 text-[#258BFF] flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email Desk
                  </p>
                  <p className="font-display text-lg font-bold text-[#071426] break-all">
                    {settings.email}
                  </p>
                </div>
              </div>
              <a
                href={`mailto:${settings.email}`}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#258BFF] hover:underline"
              >
                Send direct email &rarr;
              </a>
            </div>

            <div className="bg-[#102B50] text-white rounded-xl p-7">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-[#E5AC32] shrink-0" />
                <p className="font-display text-base font-semibold">100% Online Operations</p>
              </div>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {content.onlineBanner} All sessions, consultations, and deliveries happen online.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-7 sm:p-10">
            <h2 className="font-display text-2xl font-bold text-[#071426]">Send a Message</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your message is stored securely and answered by the APJ Tech online team.
            </p>

            {submittedId && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-900">
                  <p className="font-semibold">Message sent successfully!</p>
                  <p className="mt-0.5 text-xs">
                    Reference ID: <span className="font-mono font-semibold">{submittedId}</span>.
                    We will respond via email or WhatsApp shortly.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#071426] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#071426] mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9XXXXXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#071426] mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Course, Service, or General Enquiry"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#071426] mb-1.5">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our team help you?"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#258BFF] hover:bg-[#1A73E8] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
